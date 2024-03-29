import uuid
from datetime import datetime
from typing import Optional

from pydantic import BaseModel

from api_server.assets.schemas import AssetOut
from api_server.processing_requests.model import ProcessingRequestStatus, ProcessingRequestType


class ProcessingRequestIn(BaseModel):
    type: ProcessingRequestType
    project_id: uuid.UUID
    input_assets_ids: list[uuid.UUID] = []
    should_notify: bool = False


class ProcessingRequestOut(BaseModel):
    id: uuid.UUID
    creation_time: datetime
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    type: ProcessingRequestType
    status: ProcessingRequestStatus
    message: Optional[str] = None
    user_id: uuid.UUID
    project_id: uuid.UUID
    input_assets_ids: list[uuid.UUID] = []
    output_assets_ids: list[uuid.UUID] = []
    output_assets: list[AssetOut] = []


class PatchProcessingRequest(BaseModel):
    status: Optional[ProcessingRequestStatus] = None
    message: Optional[str] = None
    should_notify: Optional[bool] = None
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None


class AssetIn(BaseModel):
    asset_id: uuid.UUID


class AssetsOut(BaseModel):
    assets: list[uuid.UUID]
