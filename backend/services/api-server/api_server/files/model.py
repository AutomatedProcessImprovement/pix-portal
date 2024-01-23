import uuid
from datetime import datetime
from enum import Enum
from typing import Optional

from sqlalchemy import DateTime, String, Uuid
from sqlalchemy.dialects.postgresql import ARRAY
from sqlalchemy.ext.asyncio import AsyncAttrs
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column


class FileType(str, Enum):
    EVENT_LOG_CSV = "event_log_csv"
    EVENT_LOG_CSV_GZ = "event_log_csv_gz"
    EVENT_LOG_COLUMN_MAPPING_JSON = "event_log_column_mapping_json"
    PROCESS_MODEL_BPMN = "process_model_bpmn"
    CONFIGURATION_SIMOD_YAML = "configuration_simod_yaml"
    SIMULATION_MODEL_PROSIMOS_JSON = "simulation_model_prosimos_json"
    STATISTICS_PROSIMOS_CSV = "statistics_prosimos_csv"
    CONSTRAINTS_MODEL_OPTIMOS_JSON = "constraints_model_optimos_json"
    WAITING_TIME_ANALYSIS_REPORT_KRONOS_JSON = "waiting_time_analysis_report_kronos_json"
    WAITING_TIME_ANALYSIS_REPORT_KRONOS_CSV = "waiting_time_analysis_report_kronos_csv"

    def is_valid(self) -> bool:
        return self in FileType.__members__.values()


class Base(AsyncAttrs, DeclarativeBase):
    pass


class File(Base):
    __tablename__ = "file"

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)

    # Timestamps

    creation_time: Mapped[datetime] = mapped_column(DateTime, nullable=False, default=datetime.utcnow)
    deletion_time: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)

    # File information

    name: Mapped[str] = mapped_column(nullable=False)
    type: Mapped[FileType] = mapped_column(String, nullable=False)
    content_hash: Mapped[str] = mapped_column(nullable=False)
    url: Mapped[str] = mapped_column(nullable=False)

    # Implicit relationships to other microservices' tables

    # NOTE: we don't index _ids columns because of a pretty low limit on the default btree index size.
    #       If you still need indexing, consider this SQLAlchemy documentation page,
    #       https://docs.sqlalchemy.org/en/20/dialects/postgresql.html#index-types
    users_ids: Mapped[list[uuid.UUID]] = mapped_column(ARRAY(Uuid), nullable=False, default=[])

    def is_valid(self) -> bool:
        return self.type.is_valid()
