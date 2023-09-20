import uuid
from datetime import datetime
from typing import AsyncGenerator, Optional

from fastapi import Depends

from ..repositories.asset_repository import get_asset_repository
from ..repositories.asset_repository_interface import AssetRepositoryInterface
from ..repositories.models import Asset, AssetType
from .file import FileService


class AssetService:
    def __init__(
        self, asset_repository: AssetRepositoryInterface, file_service: FileService
    ) -> None:
        self.asset_repository = asset_repository
        self.file_service = file_service

    async def get_assets(self) -> list[Asset]:
        return await self.asset_repository.get_assets()

    async def get_assets_by_project_id(self, project_id: uuid.UUID) -> list[Asset]:
        return await self.asset_repository.get_assets_by_project_id(project_id)

    async def get_assets_by_processing_request_id(
        self, processing_request_id: uuid.UUID
    ) -> list[Asset]:
        return await self.asset_repository.get_assets_by_processing_request_id(
            processing_request_id
        )

    async def create_asset(
        self,
        name: str,
        type: str,
        file_id: uuid.UUID,
        project_id: uuid.UUID,
        processing_requests_ids: list[uuid.UUID] = [],
        description: Optional[str] = None,
    ) -> Asset:
        asset_type = AssetType(type)
        return await self.asset_repository.create_asset(
            name,
            asset_type,
            file_id,
            project_id,
            processing_requests_ids,
            description,
        )

    async def get_asset(self, asset_id: uuid.UUID) -> Asset:
        return await self.asset_repository.get_asset(asset_id)

    async def update_asset(
        self,
        asset_id: uuid.UUID,
        name: Optional[str] = None,
        type: Optional[AssetType] = None,
        file_id: Optional[uuid.UUID] = None,
        project_id: Optional[uuid.UUID] = None,
        processing_requests_ids: Optional[list[uuid.UUID]] = None,
        description: Optional[str] = None,
    ) -> Asset:
        modification_time = datetime.utcnow()
        return await self.asset_repository.update_asset(
            asset_id,
            name=name,
            type=type,
            file_id=file_id,
            project_id=project_id,
            processing_requests_ids=processing_requests_ids,
            description=description,
            modification_time=modification_time,
        )

    async def delete_asset(self, asset_id: uuid.UUID, token: str) -> None:
        asset = await self.get_asset(asset_id)
        await self.asset_repository.delete_asset(asset_id)
        deleted_ok = await self.file_service.delete_file(asset.file_id, token=token)
        if not deleted_ok:
            raise Exception("Asset deleted but file deletion failed")

    async def get_file_by_asset_id(self, asset_id: uuid.UUID, token: str) -> dict:
        asset = await self.get_asset(asset_id)
        return await self.file_service.get_file(asset.file_id, token=token)

    async def get_file(self, file_id: uuid.UUID, token: str) -> dict:
        return await self.file_service.get_file(file_id, token=token)

    async def get_file_location(self, asset_id: uuid.UUID, token: str) -> str:
        asset = await self.get_asset(asset_id)
        file = await self.file_service.get_file(asset.file_id, token=token)
        relative_url = file["url"]
        absolute_url = self.file_service.get_absolute_url(relative_url)
        return absolute_url


async def get_asset_service(
    asset_repository: AssetRepositoryInterface = Depends(get_asset_repository),
    file_service: FileService = Depends(FileService),
) -> AsyncGenerator[AssetService, None]:
    yield AssetService(asset_repository, file_service)
