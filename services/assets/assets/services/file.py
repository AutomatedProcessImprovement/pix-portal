import uuid
from typing import AsyncGenerator
from urllib.parse import urljoin

import httpx

from ..settings import settings


class FileService:
    def __init__(self):
        self._client = httpx.AsyncClient()
        self._base_url = settings.file_service_url.unicode_string()

    async def get_file(self, file_id: uuid.UUID, token: str) -> dict:
        """
        Gets a file using the file service.
        """
        url = self._file_resource_url(file_id)
        response = await self._client.get(
            url, headers={"Authorization": f"Bearer {token}"}
        )
        return response.json()

    async def delete_file(self, file_id: uuid.UUID, token: str) -> bool:
        """
        Delets a file using the file service.
        Returns True if the file was deleted successfully.
        """
        url = self._file_resource_url(file_id)
        response = await self._client.delete(
            url, headers={"Authorization": f"Bearer {token}"}
        )

        if response.status_code == 204:
            return True

        return False

    def get_absolute_url(self, relative_url: str) -> str:
        return urljoin(self._base_url, relative_url)

    def _file_resource_url(self, file_id: uuid.UUID) -> str:
        return urljoin(self._base_url, f"{file_id}")


async def get_file_service() -> AsyncGenerator[FileService, None]:
    yield FileService()
