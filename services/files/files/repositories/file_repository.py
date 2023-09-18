import uuid
from typing import AsyncGenerator

from fastapi import Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from .db import get_async_session
from .file_repository_interface import FileRepositoryInterface
from .models import File


class FileRepository(FileRepositoryInterface):
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_files(self) -> list[File]:
        return await self.session.execute(select(File)).scalars().all()

    async def get_file(self, file_id: uuid.UUID) -> File:
        return await self.session.execute(
            select(File).filter(File.id == file_id)
        ).scalar()

    async def create_file(self, content_hash: str, url: str) -> File:
        file = File(content_hash=content_hash, url=url)
        self.session.add(file)
        await self.session.commit()
        return file

    async def delete_file(self, file_id: uuid.UUID) -> None:
        await self.session.execute(select(File).filter(File.id == file_id)).delete()
        await self.session.commit()


async def get_file_repository(
    session: AsyncSession = Depends(get_async_session),
) -> AsyncGenerator[FileRepository]:
    yield FileRepository(session)
