from abc import ABC, abstractmethod
from collections.abc import Coroutine
from typing import Optional, Sequence
from uuid import UUID

from .models import Project


class ProjectRepositoryInterface(ABC):
    @abstractmethod
    def get_projects(self) -> Coroutine[Sequence[Project]]:
        pass

    @abstractmethod
    def get_projects_by_user_id(self, user_id: UUID) -> Coroutine[Sequence[Project]]:
        pass

    @abstractmethod
    def create_project(
        self,
        name: str,
        users_ids: list[UUID],
        assets_ids: list[UUID] = [],
        processing_requests_ids: list[UUID] = [],
        description: Optional[str] = None,
    ) -> Coroutine[Project]:
        pass

    @abstractmethod
    def get_project(self, project_id: UUID) -> Coroutine[Project]:
        pass

    @abstractmethod
    def update_project(
        self,
        project_id: UUID,
        name: Optional[str] = None,
        description: Optional[str] = None,
    ) -> Coroutine[Project]:
        pass

    @abstractmethod
    def add_user_to_project(self, project_id: UUID, user_id: UUID) -> Coroutine[Project]:
        pass

    @abstractmethod
    def remove_user_from_project(self, project_id: UUID, user_id: UUID) -> Coroutine[Project]:
        pass

    @abstractmethod
    def add_asset_to_project(self, project_id: UUID, asset_id: UUID) -> Coroutine[Project]:
        pass

    @abstractmethod
    def remove_asset_from_project(self, project_id: UUID, asset_id: UUID) -> Coroutine[Project]:
        pass

    @abstractmethod
    def add_processing_request_to_project(self, project_id: UUID, processing_request_id: UUID) -> Coroutine[Project]:
        pass

    @abstractmethod
    def delete_project(self, project_id: int) -> Coroutine[None]:
        pass
