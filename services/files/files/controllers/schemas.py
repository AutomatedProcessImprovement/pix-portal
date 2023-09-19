import uuid
from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class FileOut(BaseModel):
    id: uuid.UUID
    url: str
    content_hash: str
    creation_time: datetime
    deletion_time: Optional[datetime] = None

    @staticmethod
    def from_orm(file):
        return FileOut(**file.__dict__)


class LocationOut(BaseModel):
    location: str
