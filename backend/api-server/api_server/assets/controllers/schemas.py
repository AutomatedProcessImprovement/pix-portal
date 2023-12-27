import uuid
from datetime import datetime
from typing import Optional

from pydantic import BaseModel

from api_server.assets.persistence.model import AssetType


class AssetIn(BaseModel):
    name: str
    description: Optional[str] = None
    type: str
    project_id: uuid.UUID
    files_ids: list[uuid.UUID]
    users_ids: Optional[list[uuid.UUID]] = None
    processing_requests_ids: list[uuid.UUID] = []


class AssetOut(BaseModel):
    id: uuid.UUID
    creation_time: datetime
    modification_time: Optional[datetime] = None
    deletion_time: Optional[datetime] = None
    name: str
    description: Optional[str] = None
    type: str
    project_id: uuid.UUID
    files_ids: list[uuid.UUID] = []
    users_ids: list[uuid.UUID]
    processing_requests_ids: list[uuid.UUID] = []
    files: Optional[list[dict]] = None  # transient field not persisted in the database


class AssetPatchIn(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    type: Optional[AssetType] = None
    project_id: Optional[uuid.UUID] = None
    files_ids: Optional[list[uuid.UUID]] = None
    users_ids: Optional[list[uuid.UUID]] = None
    processing_requests_ids: Optional[list[uuid.UUID]] = None


class LocationOut(BaseModel):
    location: str
