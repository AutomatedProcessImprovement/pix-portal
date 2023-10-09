from typing import Optional
from urllib.parse import urljoin

import httpx
from pix_portal_lib.services.self_authenticating_service import SelfAuthenticatingService

from simulation_prosimos.settings import settings


class ProjectService(SelfAuthenticatingService):
    def __init__(self):
        super().__init__()
        self._client = httpx.AsyncClient()
        self._base_url = settings.project_service_url.unicode_string()

    async def add_asset_to_project(self, project_id: str, asset_id: str, token: Optional[str] = None) -> dict:
        url = urljoin(self._base_url, f"{project_id}/assets")
        response = await self._client.post(url, headers=await self.request_headers(token), json={"asset_id": asset_id})
        response.raise_for_status()
        return response.json()
