from typing import AsyncGenerator

from .project import ProjectService


async def get_project_service() -> AsyncGenerator[ProjectService, None]:
    yield ProjectService()
