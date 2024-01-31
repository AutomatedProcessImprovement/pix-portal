import asyncio
import uuid
from typing import AsyncGenerator, Optional, Sequence

from fastapi import Depends

from api_server.assets.model import Asset, AssetType
from api_server.assets.repository import AssetRepository, get_asset_repository
from api_server.assets.schemas import AssetOut
from api_server.files.model import File
from api_server.files.service import FileService, get_file_service


class AssetService:
    def __init__(
        self,
        asset_repository: AssetRepository,
        file_service: FileService,
    ) -> None:
        self.asset_repository = asset_repository
        self.file_service = file_service

    async def get_assets(self) -> Sequence[Asset]:
        return await self.asset_repository.get_assets()

    async def get_assets_by_ids(self, assets_ids: list[uuid.UUID]) -> Sequence[Asset]:
        return await self.asset_repository.get_assets_by_ids(assets_ids)

    async def get_assets_by_project_id(self, project_id: uuid.UUID) -> Sequence[Asset]:
        return await self.asset_repository.get_assets_by_project_id(project_id)

    async def get_assets_by_processing_request_id(self, processing_request_id: uuid.UUID) -> Sequence[Asset]:
        return await self.asset_repository.get_assets_by_processing_request_id(processing_request_id)

    async def create_asset(
        self,
        name: str,
        type: str,
        project_id: uuid.UUID,
        files_ids: list[uuid.UUID],
        users_ids: list[uuid.UUID],
        processing_requests_ids: list[uuid.UUID],
        description: Optional[str] = None,
    ) -> Asset:
        for file_id in files_ids:
            if await self.file_service.is_deleted(file_id):
                raise Exception(f"File is deleted: {file_id}")

        asset_type = AssetType(type)
        asset = await self.asset_repository.create_asset(
            name=name,
            type=asset_type,
            project_id=project_id,
            files_ids=files_ids,
            users_ids=users_ids,
            processing_requests_ids=processing_requests_ids,
            description=description,
        )

        return asset

    async def get_asset(self, asset_id: uuid.UUID, lazy: bool = True) -> AssetOut:
        asset = await self.asset_repository.get_asset(asset_id)
        if lazy:
            return AssetOut(**asset.__dict__)
        result = await self._post_process([asset])
        return result[0]

    async def update_asset(
        self,
        asset_id: uuid.UUID,
        name: Optional[str] = None,
        type: Optional[AssetType] = None,
        files_ids: Optional[list[uuid.UUID]] = None,
        users_ids: Optional[list[uuid.UUID]] = None,
        project_id: Optional[uuid.UUID] = None,
        processing_requests_ids: Optional[list[uuid.UUID]] = None,
        description: Optional[str] = None,
    ) -> Asset:
        return await self.asset_repository.update_asset(
            asset_id,
            name=name,
            type=type,
            files_ids=files_ids,
            users_ids=users_ids,
            project_id=project_id,
            processing_requests_ids=processing_requests_ids,
            description=description,
        )

    async def delete_asset(self, asset_id: uuid.UUID) -> None:
        asset = await self.get_asset(asset_id)
        await self.asset_repository.delete_asset(asset_id)
        for file_id in asset.files_ids:
            await self.file_service.delete_file(file_id)

    async def delete_assets_by_project_id(self, project_id: uuid.UUID) -> None:
        assets = await self.get_assets_by_project_id(project_id)
        asset_ids = [asset.id for asset in assets]
        await self.asset_repository.delete_assets(asset_ids)
        for asset in assets:
            for file_id in asset.files_ids:
                await self.file_service.delete_file(file_id)

    async def does_asset_exist(self, asset_id: uuid.UUID) -> bool:
        asset = await self.asset_repository.get_asset(asset_id)
        if not asset or asset.deletion_time is not None:
            return False
        return True

    async def get_assets_by_file_id(self, file_id: uuid.UUID) -> Sequence[Asset]:
        return await self.asset_repository.get_assets_by_file_id(file_id)

    async def get_files_by_asset_id(self, asset_id: uuid.UUID) -> list[File]:
        asset = await self.get_asset(asset_id)
        return await self._fetch_files(asset.files_ids)

    async def _fetch_files(self, files_ids: Optional[list[uuid.UUID]]) -> list[File]:
        if not files_ids or len(files_ids) == 0:
            return []
        files = await asyncio.gather(*[self.file_service.get_file(file_id) for file_id in files_ids])
        return list(files)

    async def get_file(self, file_id: uuid.UUID) -> File:
        return await self.file_service.get_file(file_id)

    async def get_file_location(self, file_id: uuid.UUID, is_internal: bool) -> str:
        file = await self.file_service.get_file(file_id)
        relative_url = file.url
        absolute_url = self.file_service.get_absolute_url(relative_url, is_internal)
        return absolute_url

    async def user_has_access_to_asset(self, user_id: uuid.UUID, asset_id: uuid.UUID) -> bool:
        asset = await self.get_asset(asset_id)
        user_id = str(user_id)
        users_ids = [str(user_id) for user_id in asset.users_ids]
        return user_id in users_ids

    async def _post_process(self, assets: Sequence[Asset]) -> Sequence[AssetOut]:
        # convert to AssetOut and fetch files
        assets_ = [AssetOut(**asset.__dict__) for asset in assets]
        for asset in assets_:
            asset.files = await self._fetch_files(asset.files_ids)
        return assets_


async def get_asset_service(
    asset_repository: AssetRepository = Depends(get_asset_repository),
    file_service: FileService = Depends(get_file_service),
) -> AsyncGenerator[AssetService, None]:
    yield AssetService(asset_repository, file_service)
