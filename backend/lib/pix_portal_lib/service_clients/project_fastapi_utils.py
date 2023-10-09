from typing import AsyncGenerator

from .project import ProjectServiceClient


async def get_project_service_client() -> AsyncGenerator[ProjectServiceClient, None]:
    yield ProjectServiceClient()
