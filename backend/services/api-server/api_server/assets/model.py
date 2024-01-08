import uuid
from datetime import datetime
from enum import Enum
from typing import List, Optional

from sqlalchemy import DateTime, String, Uuid
from sqlalchemy.dialects.postgresql import ARRAY
from sqlalchemy.ext.asyncio import AsyncAttrs
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column


class AssetType(str, Enum):
    EVENT_LOG = "event_log"
    PROCESS_MODEL = "process_model"
    SIMULATION_MODEL = "simulation_model"
    SIMOD_CONFIGURATION = "simod_configuration"
    OPTIMOS_CONFIGURATION = "optimos_configuration"
    KRONOS_REPORT = "kronos_report"


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

    project_id: Mapped[uuid.UUID] = mapped_column(Uuid, nullable=False)
    users_ids: Mapped[list[uuid.UUID]] = mapped_column(ARRAY(Uuid), nullable=False, default=[], index=True)
    files_ids: Mapped[List[uuid.UUID]] = mapped_column(ARRAY(Uuid), nullable=False, default=[])
    processing_requests_ids: Mapped[List[uuid.UUID]] = mapped_column(
        ARRAY(Uuid), nullable=False, default=[], index=True
    )
