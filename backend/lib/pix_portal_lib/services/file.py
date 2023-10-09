import os
import uuid
from pathlib import Path
from typing import Optional
from urllib.parse import urljoin

import httpx

from .self_authenticating_service import SelfAuthenticatingService

file_service_url = os.environ.get("FILE_SERVICE_URL")
blobs_base_url = os.environ.get("BLOBS_BASE_URL")


# some of the services that use this class could have access to an expired token,
# in that case, the service has to be able to authenticate itself, SelfAuthenticatingService provides
# the self.token property that calls the auth service to get a new token if the current one is None
class FileService(SelfAuthenticatingService):
    def __init__(self):
        super().__init__()
        self._client = httpx.AsyncClient()
        self._base_url = file_service_url
        self._blobs_base_url = blobs_base_url

        if file_service_url is None:
            raise ValueError("FILE_SERVICE_URL environment variable is not set")
        if blobs_base_url is None:
            raise ValueError("BLOBS_BASE_URL environment variable is not set")

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
        if is_internal:
            return urljoin(self._base_url, relative_url)
        else:
            relative_url = relative_url.lstrip("/")
            return urljoin(self._blobs_base_url, relative_url)

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
