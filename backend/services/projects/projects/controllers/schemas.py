import uuid
from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class ProjectIn(BaseModel):
    name: str
    description: Optional[str] = None
    users_ids: list[uuid.UUID] = []
    assets_ids: list[uuid.UUID] = []
    processing_requests_ids: list[uuid.UUID] = []


class ProjectPatchIn(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None


class ProjectOut(BaseModel):
    id: uuid.UUID
    creation_time: datetime
    modification_time: Optional[datetime] = None
    deletion_time: Optional[datetime] = None
    name: str
    description: Optional[str] = None
    users_ids: list[uuid.UUID]
    assets_ids: list[uuid.UUID] = []
    processing_requests_ids: list[uuid.UUID] = []


class AddUserToProjectIn(BaseModel):
    user_id: uuid.UUID


class AddAssetToProjectIn(BaseModel):
    asset_id: uuid.UUID


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
