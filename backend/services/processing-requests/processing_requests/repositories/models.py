import uuid
from datetime import datetime
from enum import Enum
from typing import Optional

from sqlalchemy import DateTime, String, Uuid
from sqlalchemy.dialects.postgresql import ARRAY
from sqlalchemy.ext.asyncio import AsyncAttrs
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column


class ProcessingRequestType(str, Enum):
    """
    Type of the data processing activity.
    """

    SIMULATION_PROSIMOS = "simulation_prosimos"
    SIMULATION_MODEL_OPTIMIZATION_SIMOD = "process_model_optimization_simod"
    SIMULATION_MODEL_OPTIMIZATION_OPTIMOS = "process_model_optimization_optimos"
    WAITING_TIME_ANALYSIS_KRONOS = "waiting_time_analysis_kronos"


class ProcessingRequestStatus(str, Enum):
    """
    Status of the data processing activity.
    """

    CREATED = "created"
    RUNNING = "running"
    FINISHED = "finished"
    FAILED = "failed"
    CANCELLED = "cancelled"


class Base(AsyncAttrs, DeclarativeBase):
    pass


class ProcessingRequest(Base):
    __tablename__ = "processing_request"

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)

    # Timestamps

    creation_time: Mapped[datetime] = mapped_column(DateTime, nullable=False, default=datetime.utcnow, index=True)
    start_time: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True, index=True)
    end_time: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True, index=True)

    # Processing request information

    type: Mapped[ProcessingRequestType] = mapped_column(String, nullable=False, index=True)
    status: Mapped[ProcessingRequestStatus] = mapped_column(String, nullable=False, index=True)
    message: Mapped[Optional[str]] = mapped_column(String, nullable=True)

    # Implicit relationships to other microservices' tables

    user_id: Mapped[uuid.UUID] = mapped_column(Uuid, nullable=False, index=True)
    project_id: Mapped[uuid.UUID] = mapped_column(Uuid, nullable=False, index=True)
    input_assets_ids: Mapped[list[uuid.UUID]] = mapped_column(ARRAY(Uuid), nullable=False, default=[], index=True)
    output_assets_ids: Mapped[list[uuid.UUID]] = mapped_column(ARRAY(Uuid), nullable=False, default=[], index=True)
