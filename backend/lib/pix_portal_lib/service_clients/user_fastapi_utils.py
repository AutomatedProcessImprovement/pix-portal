from typing import AsyncGenerator

from .user import UserServiceClient


async def get_user_service_client() -> AsyncGenerator[UserServiceClient, None]:
    yield UserServiceClient()
