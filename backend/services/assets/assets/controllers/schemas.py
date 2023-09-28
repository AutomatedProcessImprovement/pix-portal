import uuid
from datetime import datetime
from typing import Optional

from pydantic import BaseModel

from ..repositories.models import AssetType


class AssetIn(BaseModel):
    name: str
    description: Optional[str] = None
    type: str
    file_id: uuid.UUID
    project_id: uuid.UUID
    processing_requests_ids: list[uuid.UUID] = []


class AssetOut(BaseModel):
    id: uuid.UUID
    creation_time: datetime
    modification_time: Optional[datetime] = None
    deletion_time: Optional[datetime] = None
    name: str
    description: Optional[str] = None
    type: str
    file_id: uuid.UUID
    project_id: uuid.UUID
    processing_requests_ids: list[uuid.UUID] = []


class AssetPatchIn(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    type: Optional[AssetType] = None
    file_id: Optional[uuid.UUID] = None
    project_id: Optional[uuid.UUID] = None
    processing_requests_ids: Optional[list[uuid.UUID]] = None


class LocationOut(BaseModel):
    location: str
