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
    PROCESS_MODEL_BPMN = "process_model_bpmn"
    CONFIGURATION_SIMOD_YAML = "simod_configuration_yaml"
    SIMULATION_MODEL_PROSIMOS_JSON = "bps_model_prosimos_json"
    CONSTRAINTS_MODEL_OPTIMOS_JSON = "constraints_model_optimos_json"


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