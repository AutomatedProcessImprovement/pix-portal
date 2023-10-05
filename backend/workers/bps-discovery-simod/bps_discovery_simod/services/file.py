from pathlib import Path
from typing import Optional

import httpx

from bps_discovery_simod.services.self_authenticating_service import SelfAuthenticatingService
from bps_discovery_simod.settings import settings


class FileService(SelfAuthenticatingService):
    def __init__(self):
        super().__init__()
        self._client = httpx.AsyncClient()
        self._base_url = settings.file_service_url.unicode_string()

    async def upload_file(self, file_path: Path, token: Optional[str] = None) -> str:
        """
        Uploads a file to the file service and returns the file ID.
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
