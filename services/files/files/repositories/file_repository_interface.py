import uuid
from abc import ABC, abstractmethod

from .models import File


class FileRepositoryInterface(ABC):
    @abstractmethod
    def get_files(self) -> list[File]:
        pass

    @abstractmethod
    def get_file(self, file_id: uuid.UUID) -> File:
        pass

    @abstractmethod
    def get_file_by_hash(self, hash: str) -> File:
        pass

    @abstractmethod
    def get_file_hash(self, file_id: uuid.UUID) -> str:
        pass

    @abstractmethod
    def create_file(self, conent_hash: str, url: str) -> File:
        pass

    @abstractmethod
    def delete_file(self, file_id: int) -> None:
        pass
