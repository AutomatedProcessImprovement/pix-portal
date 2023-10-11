import uuid
from pathlib import Path
from typing import Optional
from urllib.parse import urljoin

import httpx

from .self_authenticating_client import SelfAuthenticatingClient
from ..utils import get_env

file_service_url = get_env("FILE_SERVICE_URL")
blobs_base_public_url = get_env("BLOBS_BASE_PUBLIC_URL")
blobs_base_internal_url = get_env("BLOBS_BASE_INTERNAL_URL")


# some of the services that use this class could have access to an expired token,
# in that case, the service has to be able to authenticate itself, SelfAuthenticatingClient provides
# the self.token property that calls the auth service to get a new token if the current one is None
class FileServiceClient(SelfAuthenticatingClient):
    def __init__(self):
        super().__init__()
        self._client = httpx.AsyncClient()
        self._base_url = file_service_url
        self._blobs_base_public_url = blobs_base_public_url
        self._blobs_base_internal_url = blobs_base_internal_url

    async def get_file(self, file_id: uuid.UUID, token: str) -> dict:
        """
        Gets a file using the file service.
        """
        url = self._file_resource_url(file_id)
        response = await self._client.get(url, headers={"Authorization": f"Bearer {token}"})
        return response.json()

    async def delete_file(self, file_id: uuid.UUID, token: str) -> bool:
        """
        Deletes a file using the file service.
        Returns True if the file was deleted successfully.
        """
        url = self._file_resource_url(file_id)
        response = await self._client.delete(url, headers={"Authorization": f"Bearer {token}"})

        if response.status_code == 204:
            return True

        return False

    def get_absolute_url(self, relative_url: str, is_internal: bool) -> str:
        base = self._blobs_base_internal_url if is_internal else self._blobs_base_public_url
        relative_url = relative_url.lstrip("/blobs/")
        return urljoin(base, relative_url)

    async def upload_file(self, file_path: Path, token: Optional[str] = None) -> str:
        """
        Uploads a file to the file service and returns the file ID.
        If token is not provided, the service will authenticate itself as a SYSTEM user.
        """
        content = file_path.read_bytes()
        t = token or await self.token
        response = await self._client.post(
            self._base_url,
            headers={
                "Authorization": f"Bearer {t}",
                "Content-Type": "application/octet-stream",
            },
            content=content,
        )
        response.raise_for_status()
        return response.json()["id"]

    def _file_resource_url(self, file_id: uuid.UUID) -> str:
        return urljoin(self._base_url, f"{file_id}")
