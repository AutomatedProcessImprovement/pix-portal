import uuid
from abc import ABC, abstractmethod
from collections.abc import Coroutine, Sequence

from .models import File


class FileRepositoryInterface(ABC):
    @abstractmethod
    def get_files(self) -> Coroutine[Sequence[File]]:
        pass

    @abstractmethod
    def get_file(self, file_id: uuid.UUID) -> Coroutine[File]:
        pass

    @abstractmethod
    def get_file_by_hash(self, hash: str) -> Coroutine[File]:
        pass

    @abstractmethod
    def get_file_hash(self, file_id: uuid.UUID) -> Coroutine[str]:
        pass

    @abstractmethod
    def create_file(self, conent_hash: str, url: str) -> Coroutine[File]:
        pass

    @abstractmethod
    def delete_file(self, file_id: int) -> Coroutine[None]:
        pass
