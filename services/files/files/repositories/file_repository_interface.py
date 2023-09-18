from abc import ABC, abstractmethod

from .models import File


class FileRepositoryInterface(ABC):
    @abstractmethod
    def get_files(self) -> list[File]:
        pass

    @abstractmethod
    def get_file(self, file_id: int) -> File:
        pass

    @abstractmethod
    def create_file(self, conent_hash: str, url: str) -> File:
        pass

    @abstractmethod
    def delete_file(self, file_id: int) -> None:
        pass
