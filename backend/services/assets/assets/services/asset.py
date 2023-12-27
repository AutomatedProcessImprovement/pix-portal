import asyncio
import uuid
from typing import AsyncGenerator, Optional, Sequence

from fastapi import Depends
from pix_portal_lib.service_clients.file import File, FileServiceClient
from pix_portal_lib.service_clients.project import ProjectServiceClient

from assets.controllers.schemas import AssetOut
from assets.persistence.model import Asset, AssetType
from assets.persistence.repository import AssetRepository, get_asset_repository


class AssetService:
    def __init__(
        self,
        asset_repository: AssetRepository,
        file_service_client: FileServiceClient,
        project_service_client: ProjectServiceClient,
    ) -> None:
        self.asset_repository = asset_repository
        self.file_service_client = file_service_client
        self.project_service_client = project_service_client

    async def get_assets(self) -> Sequence[Asset]:
        return await self.asset_repository.get_assets()

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
        token: str,
        description: Optional[str] = None,
    ) -> Asset:
        for file_id in files_ids:
            await self.file_service_client.is_deleted(file_id, token=token)

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

        await self.project_service_client.add_asset_to_project(str(project_id), str(asset.id))

        return asset

    async def get_asset(self, asset_id: uuid.UUID, token: Optional[str] = None, lazy: bool = True) -> AssetOut:
        if lazy:
            asset = await self.asset_repository.get_asset(asset_id)
            return AssetOut(**asset.__dict__)

        assert token is not None, "token must be provided if lazy is False"
        asset = await self.asset_repository.get_asset(asset_id)
        result = await self._post_process([asset], token)
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

    async def delete_asset(self, asset_id: uuid.UUID, token: str) -> None:
        asset = await self.get_asset(asset_id)
        await self.asset_repository.delete_asset(asset_id)

        for file_id in asset.files_ids:
            involved_assets = await self.get_assets_by_file_id(file_id, token=token)

            # guard to avoid deleting files that are used by other assets
            involved_assets = [asset for asset in involved_assets if (asset.id != asset_id and not asset.deletion_time)]
            if len(involved_assets) > 0:
                continue

            deleted_ok = await self.file_service_client.delete_file(file_id, token=token)
            if not deleted_ok:
                raise Exception("Asset deleted but files deletion failed")

    async def get_assets_by_file_id(self, file_id: uuid.UUID, token: str) -> list[Asset]:
        return await self.asset_repository.get_assets_by_file_id(file_id)

    async def get_files_by_asset_id(self, asset_id: uuid.UUID, token: str) -> list[dict]:
        asset = await self.get_asset(asset_id, token=token)
        return await self._fetch_files(asset.files_ids, token=token)

    async def _fetch_files(self, files_ids: Optional[list[uuid.UUID]], token: str) -> list[dict]:
        if not files_ids or len(files_ids) == 0:
            return []
        files = await asyncio.gather(
            *[self.file_service_client.get_file(file_id, token=token) for file_id in files_ids]
        )
        return list(files)

    async def get_file(self, file_id: uuid.UUID, token: str) -> File:
        return await self.file_service_client.get_file(file_id, token=token)

    async def get_file_location(self, file_id: uuid.UUID, is_internal: bool, token: str) -> str:
        file = await self.file_service_client.get_file(file_id, token=token)
        relative_url = file.url
        absolute_url = self.file_service_client.get_absolute_url(relative_url, is_internal)
        return absolute_url

    async def user_has_access_to_asset(self, user_id: uuid.UUID, asset_id: uuid.UUID) -> bool:
        asset = await self.get_asset(asset_id)
        user_id = str(user_id)
        users_ids = [str(user_id) for user_id in asset.users_ids]
        return user_id in users_ids

    async def _post_process(self, assets: Sequence[Asset], token: str) -> Sequence[AssetOut]:
        # convert to AssetOut and fetch files
        assets_ = [AssetOut(**asset.__dict__) for asset in assets]
        for asset in assets_:
            asset.files = await self._fetch_files(asset.files_ids, token=token)
        return assets_


async def get_asset_service(
    asset_repository: AssetRepository = Depends(get_asset_repository),
    file_service_client: FileServiceClient = Depends(FileServiceClient),
    project_service_client: ProjectServiceClient = Depends(ProjectServiceClient),
) -> AsyncGenerator[AssetService, None]:
    yield AssetService(asset_repository, file_service_client, project_service_client)
