import uuid
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class FileOut(BaseModel):
    id: uuid.UUID = Field()
    url: str
    content_hash: str
    creation_time: datetime
    deletion_time: Optional[datetime] = None


class LocationOut(BaseModel):
    location: str
