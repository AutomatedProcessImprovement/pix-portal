import uuid
from datetime import datetime
from enum import Enum
from typing import Optional

from sqlalchemy import DateTime, String, Uuid
from sqlalchemy.dialects.postgresql import ARRAY
from sqlalchemy.ext.asyncio import AsyncAttrs
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column


class AssetType(str, Enum):
    EVENT_LOG_CSV = "event_log_csv"
    EVENT_LOG_CSV_GZ = "event_log_csv_gz"
    EVENT_LOG_COLUMN_MAPPING_JSON = "event_log_column_mapping_json"
    PROCESS_MODEL_BPMN = "process_model_bpmn"
    CONFIGURATION_SIMOD_YAML = "configuration_simod_yaml"
    SIMULATION_MODEL_PROSIMOS_JSON = "simulation_model_prosimos_json"
    CONFIGURATION_PROSIMOS_YAML = "configuration_prosimos_yaml"
    CONSTRAINTS_MODEL_OPTIMOS_JSON = "constraints_model_optimos_json"
    WAITING_TIME_ANALYSIS_REPORT_KRONOS_JSON = "waiting_time_analysis_report_kronos_json"
    WAITING_TIME_ANALYSIS_REPORT_KRONOS_CSV = "waiting_time_analysis_report_kronos_csv"


class Base(AsyncAttrs, DeclarativeBase):
    pass


class Asset(Base):
    __tablename__ = "asset"

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)

    # Timestamps

    creation_time: Mapped[datetime] = mapped_column(DateTime, nullable=False, default=datetime.utcnow)
    modification_time: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    deletion_time: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)

    # Asset information

    name: Mapped[str] = mapped_column(nullable=False)
    description: Mapped[Optional[str]] = mapped_column(nullable=True)
    type: Mapped[AssetType] = mapped_column(String, nullable=False)

    # Implicit relationships to other microservices' tables

    file_id: Mapped[Optional[uuid.UUID]] = mapped_column(Uuid, nullable=False)
    project_id: Mapped[uuid.UUID] = mapped_column(Uuid, nullable=False)
    processing_requests_ids: Mapped[list[uuid.UUID]] = mapped_column(ARRAY(Uuid), nullable=False, default=[])
