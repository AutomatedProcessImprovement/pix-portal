import uuid
from datetime import datetime
from typing import Optional

from sqlalchemy import DateTime, Uuid
from sqlalchemy.dialects.postgresql import ARRAY
from sqlalchemy.ext.asyncio import AsyncAttrs
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column


class Base(AsyncAttrs, DeclarativeBase):
    pass


class Project(Base):
    __tablename__ = "project"

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)

    # Timestamps

    creation_time: Mapped[datetime] = mapped_column(DateTime, nullable=False, default=datetime.utcnow, index=True)
    modification_time: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True, index=True)
    deletion_time: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True, index=True)

    # Project information

    name: Mapped[str] = mapped_column(nullable=False, index=True)
    description: Mapped[Optional[str]] = mapped_column(nullable=True)

    # Implicit relationships to other microservices' tables

    # must have at least one user
    # NOTE: we don't index _ids columns because of a pretty low limit on the default btree index size.
    #       If you still need indexing, consider this SQLAlchemy documentation page,
    #       https://docs.sqlalchemy.org/en/20/dialects/postgresql.html#index-types
    users_ids: Mapped[list[uuid.UUID]] = mapped_column(ARRAY(Uuid), nullable=False, default=[])
    assets_ids: Mapped[list[uuid.UUID]] = mapped_column(ARRAY(Uuid), nullable=False, default=[])
    processing_requests_ids: Mapped[list[uuid.UUID]] = mapped_column(ARRAY(Uuid), nullable=False, default=[])
