import uuid
from datetime import datetime
from typing import Optional

from sqlalchemy import DateTime, Uuid
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column


class Base(DeclarativeBase):
    pass


class File(Base):
    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    creation_time: Mapped[datetime] = mapped_column(
        DateTime, nullable=False, default=datetime.utcnow
    )
    deletion_time: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    content_hash: Mapped[str] = mapped_column(nullable=False)
    url: Mapped[str] = mapped_column(nullable=False)
