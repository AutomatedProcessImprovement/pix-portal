from typing import AsyncGenerator
from urllib.parse import urljoin
from uuid import UUID

import httpx

from ..settings import settings


class ProjectNotFound(Exception):
    pass


class ProjectService:
    def __init__(self):
        self._client = httpx.AsyncClient()
        self._base_url = settings.project_service_url.unicode_string()

    async def get_project(self, project_id: UUID, token: str) -> dict:
        url = urljoin(self._base_url, str(project_id))
        response = await self._client.get(url, headers={"Authorization": f"Bearer {token}"})
        if response.status_code != 200:
            raise ProjectNotFound()
        return response.json()

    async def does_project_exist(self, project_id: UUID, token: str) -> bool:
        project = await self.get_project(project_id, token)
        return project is not None

    async def does_user_have_access_to_project(self, user_id: UUID, project_id: UUID, token: str) -> bool:
        project = await self.get_project(project_id, token)
        current_user_id = str(user_id)
        project_user_id = [str(user_id) for user_id in project["user_ids"]]
        return current_user_id in project_user_id


async def get_project_service() -> AsyncGenerator[ProjectService, None]:
    yield ProjectService()
