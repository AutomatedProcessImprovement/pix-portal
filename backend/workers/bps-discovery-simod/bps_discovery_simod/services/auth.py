import logging
from urllib.parse import urljoin

import httpx

from bps_discovery_simod.settings import settings

logger = logging.getLogger()


class AuthService:
    def __init__(self):
        self._client = httpx.AsyncClient()
        self._base_url = settings.auth_service_url.unicode_string()

    async def get_system_jwt_token(self) -> str:
        url = urljoin(self._base_url, "jwt/login")
        headers = {"Content-Type": "application/x-www-form-urlencoded"}
        response = await self._client.post(
            url,
            headers=headers,
            data={"username": settings.system_username, "password": settings.system_password},
        )
        response.raise_for_status()

        logger.info(f"SYSTEM user logged in, status_code={response.status_code}, data={response.text}, url={url}")
        data = response.json()

        return data["access_token"]
