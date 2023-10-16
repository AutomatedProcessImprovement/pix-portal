import logging
from dataclasses import dataclass
from enum import Enum
from pathlib import Path
from typing import Optional, Union
from urllib.parse import urljoin
from uuid import UUID

import httpx
from pix_portal_lib.utils import get_env

from .file import FileServiceClient
from .self_authenticating_client import SelfAuthenticatingClient

logger = logging.getLogger()


asset_service_url = get_env("ASSET_SERVICE_URL")


class AssetType(str, Enum):
    EVENT_LOG_CSV = "event_log_csv"
    EVENT_LOG_CSV_GZ = "event_log_csv_gz"
    PROCESS_MODEL_BPMN = "process_model_bpmn"
    CONFIGURATION_SIMOD_YAML = "configuration_simod_yaml"
    SIMULATION_MODEL_PROSIMOS_JSON = "simulation_model_prosimos_json"
    CONFIGURATION_PROSIMOS_YAML = "configuration_prosimos_yaml"
    CONSTRAINTS_MODEL_OPTIMOS_JSON = "constraints_model_optimos_json"


@dataclass
class Asset:
    id: str
    creation_time: str
    modification_time: str
    deletion_time: str
    name: str
    description: str
    type: AssetType
    file_id: str
    project_id: str
    processing_requests_ids: list[str]
    url: Optional[str] = None
    local_disk_path: Optional[Path] = None


@dataclass
class AssetLocationResponse:
    location: str


class AssetServiceClient(SelfAuthenticatingClient):
    def __init__(self):
        super().__init__()
        self._base_url = asset_service_url
        self._http_client = httpx.AsyncClient()
        self._file_service = FileServiceClient()

    async def download_asset(
        self, asset_id: str, output_dir: Path, is_internal: bool, token: Optional[str] = None
    ) -> Asset:
        asset = await self.get_asset(asset_id, token=token)
        asset.url = await self.get_asset_location(asset_id, is_internal=is_internal, token=token)
        response = await self._http_client.get(asset.url, headers=await self.request_headers(token))
        response.raise_for_status()

        asset.local_disk_path = output_dir / Path(asset_id)
        if asset.type == AssetType.EVENT_LOG_CSV:
            asset.local_disk_path = asset.local_disk_path.with_suffix(".csv")
        elif asset.type == AssetType.EVENT_LOG_CSV_GZ:
            asset.local_disk_path = asset.local_disk_path.with_suffix(".csv.gz")
        elif asset.type == AssetType.CONFIGURATION_SIMOD_YAML:
            asset.local_disk_path = asset.local_disk_path.with_suffix(".yaml")

        with open(asset.local_disk_path, "wb") as f:
            f.write(response.content)

        return asset

    async def get_asset(self, asset_id: Union[str, UUID], token: Optional[str] = None) -> Asset:
        url = urljoin(self._base_url, f"{asset_id}")
        response = await self._http_client.get(url, headers=await self.request_headers(token))
        response.raise_for_status()
        return Asset(**response.json())

    async def get_assets_by_ids(self, assets_ids: list[UUID], token: str) -> list[Asset]:
        return [await self.get_asset(asset_id, token) for asset_id in assets_ids]

    async def get_assets_by_project_id(self, project_id: UUID, token: str) -> list[dict]:
        response = await self._http_client.get(
            self._base_url,
            params={"project_id": str(project_id)},
            headers={"Authorization": f"Bearer {token}"},
        )
        return response.json()

    async def does_asset_exist(self, asset_id: UUID, token: str) -> bool:
        url = urljoin(self._base_url, str(asset_id))
        response = await self._http_client.get(url, headers={"Authorization": f"Bearer {token}"})
        # TODO: check if the asset is deleted
        return response.status_code == 200

    async def get_asset_location(self, asset_id: str, is_internal: bool = True, token: Optional[str] = None) -> str:
        url = urljoin(self._base_url, f"{asset_id}/location")
        response = await self._http_client.get(
            url, headers=await self.request_headers(token), params={"is_internal": is_internal}
        )
        response.raise_for_status()
        return AssetLocationResponse(**response.json()).location

    async def create_asset(
        self, file_path: Path, asset_type: AssetType, project_id: str, token: Optional[str] = None
    ) -> str:
        # upload file
        file_id = await self._file_service.upload_file(file_path, token=token)

        # create asset
        response = await self._http_client.post(
            self._base_url,
            headers=await self.request_headers(token),
            json={
                "name": file_path.name,
                "type": asset_type,
                "file_id": file_id,
                "project_id": project_id,
            },
        )
        response.raise_for_status()

        logger.info(f"Created asset status_code={response.status_code}, response={response.text}")
        data = response.json()

        return data["id"]

    async def delete_asset(self, asset_id: UUID, token: str) -> bool:
        url = urljoin(self._base_url, str(asset_id))
        response = await self._http_client.delete(url, headers={"Authorization": f"Bearer {token}"})
        if response.status_code == 204:
            return True
        raise Exception(response.text)

    async def delete_assets_by_project_id(self, project_id: UUID, token: str) -> bool:
        assets = await self.get_assets_by_project_id(project_id, token)
        for asset in assets:
            await self.delete_asset(asset["id"], token)
        return True
