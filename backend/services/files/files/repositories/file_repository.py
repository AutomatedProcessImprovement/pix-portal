import uuid
from datetime import datetime
from typing import AsyncGenerator, Sequence

from fastapi import Depends
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from .db import get_async_session
from .file_repository_interface import FileRepositoryInterface
from .models import File


class FileRepository(FileRepositoryInterface):
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_files(self) -> Sequence[File]:
        result = await self.session.execute(select(File))
        return result.scalars().all()

    async def get_file(self, file_id: uuid.UUID) -> File:
        result = await self.session.execute(select(File).where(File.id == file_id))
        file = result.scalar()
        if file is None:
            raise FileNotFoundError()
        return file

    async def get_file_by_hash(self, hash: str) -> File:
        result = await self.session.execute(select(File).where(File.content_hash == hash))
        file = result.scalar()
        if file is None:
            raise FileNotFoundError()
        return file

    async def get_file_hash(self, file_id: uuid.UUID) -> str:
        result = await self.session.execute(select(File.content_hash).where(File.id == file_id))
        content_hash = result.scalar()
        if content_hash is None:
            raise FileNotFoundError()
        return content_hash

    async def create_file(self, content_hash: str, url: str) -> File:
        file = File(content_hash=content_hash, url=url)
        self.session.add(file)
        await self.session.commit()
        return file

    async def delete_file(self, file_id: uuid.UUID) -> None:
        await self.session.execute(update(File).where(File.id == file_id).values(deletion_time=datetime.utcnow()))
        await self.session.commit()


async def get_file_repository(
    session: AsyncSession = Depends(get_async_session),
) -> AsyncGenerator[FileRepository, None]:
    yield FileRepository(session)
