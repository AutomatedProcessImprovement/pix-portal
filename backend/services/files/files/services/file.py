import hashlib
import uuid
from pathlib import Path
from typing import AsyncGenerator

from fastapi import Depends

from ..repositories.file_repository import get_file_repository
from ..repositories.file_repository_interface import FileRepositoryInterface
from ..repositories.models import File
from ..settings import settings


class FileExists(Exception):
    def __init__(self, file: File) -> None:
        super().__init__(f"File with hash {file.content_hash} already exists: {file.id}")
        self.file = file


class FileService:
    def __init__(self, file_repository: FileRepositoryInterface) -> None:
        self.base_dir = settings.base_dir
        self.file_repository = file_repository

        self.base_dir.mkdir(parents=True, exist_ok=True)

    async def save_file(self, file_bytes: bytes) -> File:
        hash = self._compute_sha256(file_bytes)

        if self._hash_exists_on_disk(hash):
            try:
                file = await self.file_repository.get_file_by_hash(hash)
                raise FileExists(file)
            except FileNotFoundError:
                # File exists on disk but not in database, continue creating the database record
                pass
        else:
            file_path = self.base_dir / hash
            with file_path.open("wb") as file:
                file.write(file_bytes)

        url = self._generate_url(hash)

        return await self.file_repository.create_file(hash, url)

    async def get_files(self) -> list[File]:
        return await self.file_repository.get_files()

    async def get_file(self, file_id: uuid.UUID) -> File:
        return await self.file_repository.get_file(file_id)

    async def delete_file(self, file_id: uuid.UUID) -> None:
        content_hash = await self.file_repository.get_file_hash(file_id)
        await self.file_repository.delete_file(file_id)
        self._remove_file_from_disk(content_hash)

    async def get_file_path(self, file_id: uuid.UUID) -> Path:
        file = await self.get_file(file_id)
        return self._file_path(file.content_hash)

    async def get_file_url(self, file_id: uuid.UUID) -> str:
        file = await self.get_file(file_id)
        return file.url

    @staticmethod
    def _compute_sha256(content: bytes) -> str:
        return hashlib.sha256(content).hexdigest()

    def _file_path(self, hash: str) -> Path:
        return self.base_dir / hash

    def _hash_exists_on_disk(self, hash: str) -> bool:
        file_path = self._file_path(hash)
        return file_path.exists()

    @staticmethod
    def _generate_url(hash: str) -> str:
        return f"/blobs/{hash}"

    def _remove_file_from_disk(self, hash: str) -> None:
        file_path = self._file_path(hash)
        file_path.unlink()


async def get_file_service(
    file_repository: FileRepositoryInterface = Depends(get_file_repository),
) -> AsyncGenerator[FileService, None]:
    yield FileService(file_repository)
