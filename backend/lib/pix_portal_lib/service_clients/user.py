from urllib.parse import urljoin
from uuid import UUID

import httpx

from ..utils import get_env

user_service_url = get_env("USER_SERVICE_URL")


class UserServiceClient:
    def __init__(self):
        self._client = httpx.AsyncClient()
        self._base_url = user_service_url

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
