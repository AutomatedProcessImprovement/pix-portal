import uuid
from datetime import datetime
from enum import Enum
from typing import Optional

from sqlalchemy import Boolean, DateTime, String, Uuid
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
    SIMULATION_MODEL_OPTIMIZATION_OPTIMOS_CANCELLATION = "simulation_model_optimization_optimos_cancellation"
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
    should_notify: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)

    # Implicit relationships to other microservices' tables

    user_id: Mapped[uuid.UUID] = mapped_column(Uuid, nullable=False, index=True)
    project_id: Mapped[uuid.UUID] = mapped_column(Uuid, nullable=False, index=True)
    # NOTE: we don't index _ids columns because of a pretty low limit on the default btree index size.
    #       If you still need indexing, consider this SQLAlchemy documentation page,
    #       https://docs.sqlalchemy.org/en/20/dialects/postgresql.html#index-types
    input_assets_ids: Mapped[list[uuid.UUID]] = mapped_column(ARRAY(Uuid), nullable=False, default=[])
    output_assets_ids: Mapped[list[uuid.UUID]] = mapped_column(ARRAY(Uuid), nullable=False, default=[])
