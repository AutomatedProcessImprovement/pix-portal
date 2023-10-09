from typing import AsyncGenerator

from .file import FileService


async def get_file_service() -> AsyncGenerator[FileService, None]:
    yield FileService()
