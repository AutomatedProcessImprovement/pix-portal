from typing import AsyncGenerator
from urllib.parse import urljoin
from uuid import UUID

import httpx

from ..settings import settings


class AssetService:
    def __init__(self):
        self._client = httpx.AsyncClient()
        self._base_url = settings.asset_service_url.unicode_string()

    async def get_asset(self, asset_id: UUID, token: str) -> dict:
        url = urljoin(self._base_url, str(asset_id))
        response = await self._client.get(url, headers={"Authorization": f"Bearer {token}"})
        return response.json()

    async def get_assets_by_ids(self, assets_ids: list[UUID], token: str) -> list[dict]:
        return [await self.get_asset(asset_id, token) for asset_id in assets_ids]

    async def get_assets_by_project_id(self, project_id: UUID, token: str) -> list[dict]:
        response = await self._client.get(
            self._base_url,
            params={"project_id": str(project_id)},
            headers={"Authorization": f"Bearer {token}"},
        )
        return response.json()

    async def does_asset_exist(self, asset_id: UUID, token: str) -> bool:
        url = urljoin(self._base_url, str(asset_id))
        response = await self._client.get(url, headers={"Authorization": f"Bearer {token}"})
        # TODO: check if the asset is deleted
        return response.status_code == 200

    async def delete_asset(self, asset_id: UUID, token: str) -> bool:
        url = urljoin(self._base_url, str(asset_id))
        response = await self._client.delete(url, headers={"Authorization": f"Bearer {token}"})
        if response.status_code == 204:
            return True
        raise Exception(response.text)

    async def delete_assets_by_project_id(self, project_id: UUID, token: str) -> bool:
        assets = await self.get_assets_by_project_id(project_id, token)
        for asset in assets:
            await self.delete_asset(asset["id"], token)
        return True

    async def add_processing_request_id_to_asset(self, asset_id: UUID, processing_request_id: UUID, token: str) -> bool:
        asset = await self.get_asset(asset_id, token)
        processing_request_ids = set(asset["processing_requests_ids"])
        processing_request_ids.add(processing_request_id)
        return await self.update_processing_request_ids_for_asset(asset_id, list(processing_request_ids), token)

    async def update_processing_request_ids_for_asset(
        self, asset_id: UUID, processing_request_ids: list[UUID], token: str
    ) -> bool:
        url = urljoin(self._base_url, f"{asset_id}")
        response = await self._client.patch(
            url,
            json={"processing_requests_ids": [str(rid) for rid in processing_request_ids]},
            headers={"Authorization": f"Bearer {token}"},
        )
        if response.status_code == 200:
            return True
        raise Exception(response.text)


async def get_asset_service() -> AsyncGenerator[AssetService, None]:
    yield AssetService()
