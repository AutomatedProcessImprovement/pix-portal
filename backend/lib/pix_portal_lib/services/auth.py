"""
Commonly used authentication service for user authentication and authorization.
"""
import logging
import os
from typing import Optional
from urllib.parse import urljoin

import httpx
from pydantic import BaseModel

logger = logging.getLogger()

auth_service_url = os.environ.get("AUTH_SERVICE_URL")
system_username = os.environ.get("SYSTEM_USERNAME")
system_password = os.environ.get("SYSTEM_PASSWORD")


class TokenVerificationResponse(BaseModel):
    status: bool
    user: dict


class AuthService:
    def __init__(self):
        self._client = httpx.AsyncClient()
        self._base_url = auth_service_url

        if self._base_url is None:
            raise ValueError("AUTH_SERVICE_URL must be set in the environment")

    async def verify_token(self, token: str, is_superuser: bool = False) -> tuple[bool, Optional[dict]]:
        """
        Verifies a JWT token and returns a tuple of (status, user).
        """
        url = urljoin(self._base_url, "jwt/verify-token")
        params = {"is_superuser": is_superuser}
        response = await self._client.post(
            url,
            headers={"Authorization": f"Bearer {token}"},
            params=params,
            follow_redirects=True,
        )

        if response.status_code != 200:
            return False, None

        response_data = TokenVerificationResponse(**response.json())
        return response_data.status, response_data.user

    async def get_system_jwt_token(self) -> str:
        """
        Get a JWT token for the system user. Used by other services to authenticate themselves.
        """
        if system_username is None or system_password is None:
            raise ValueError("SYSTEM_USERNAME and SYSTEM_PASSWORD must be set in the environment")

        url = urljoin(self._base_url, "jwt/login")
        headers = {"Content-Type": "application/x-www-form-urlencoded"}
        response = await self._client.post(
            url,
            headers=headers,
            data={"username": system_username, "password": system_password},
        )
        response.raise_for_status()

        logger.info(f"SYSTEM user logged in, status_code={response.status_code}, data={response.text}, url={url}")
        data = response.json()

        return data["access_token"]
