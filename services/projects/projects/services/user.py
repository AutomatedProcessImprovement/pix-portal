from typing import AsyncGenerator
from urllib.parse import urljoin
from uuid import UUID

import httpx

from ..settings import settings


class UserService:
    def __init__(self):
        self._client = httpx.AsyncClient()
        self._base_url = settings.user_service_url.unicode_string()

    async def does_user_exist(self, user_id: UUID, token: str) -> bool:
        url = urljoin(self._base_url, str(user_id))
        response = await self._client.get(url, headers={"Authorization": f"Bearer {token}"})
        return response.status_code == 200

    async def get_user(self, user_id: UUID, token: str) -> dict:
        url = urljoin(self._base_url, str(user_id))
        response = await self._client.get(url, headers={"Authorization": f"Bearer {token}"})
        return response.json()

    async def get_users_by_ids(self, users_ids: list[UUID], token: str) -> list[dict]:
        return [await self.get_user(user_id, token) for user_id in users_ids]


async def get_user_service() -> AsyncGenerator[UserService, None]:
    yield UserService()
