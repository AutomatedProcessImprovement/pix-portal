import asyncio
import uuid
from typing import AsyncGenerator, Optional, Sequence

from fastapi import Depends
from fastapi_users.exceptions import UserNotExists

from api_server.assets.model import Asset
from api_server.assets.service import AssetService
from api_server.assets.service import get_asset_service
from api_server.projects.model import Project
from api_server.projects.repository import ProjectRepository, get_project_repository
from api_server.users.users import UserManager, get_user_manager


class UserNotFound(Exception):
    pass


class AssetNotFound(Exception):
    pass


class AssetDeletionFailed(Exception):
    pass


class LastUserInProject(Exception):
    pass


class ProjectHasNoUsers(Exception):
    pass


class ProjectService:
    def __init__(
        self,
        project_repository: ProjectRepository,
        asset_service: AssetService,
        user_manager: UserManager,  # TODO: introduce UserService to abstract away UserManager
    ) -> None:
        self._project_repository = project_repository
        self._asset_service = asset_service
        self._user_manager = user_manager

    async def get_projects(self) -> Sequence[Project]:
        return await self._project_repository.get_projects()

    async def get_projects_by_user_id(self, user_id: uuid.UUID) -> Sequence[Project]:
        return await self._project_repository.get_projects_by_user_id(user_id)

    async def create_project(
        self,
        name: str,
        users_ids: list[uuid.UUID],
        current_user: dict,
        assets_ids: list[uuid.UUID] = [],
        processing_requests_ids: list[uuid.UUID] = [],
        description: Optional[str] = None,
    ) -> Project:
        if current_user["id"] not in users_ids:
            users_ids.insert(0, current_user["id"])

        # check users exist
        try:
            _ = await asyncio.gather(*[self._user_manager.get(user_id) for user_id in users_ids])
        except UserNotExists:
            raise UserNotFound()

        # check assets exist
        oks = await asyncio.gather(*[self._asset_service.does_asset_exist(asset_id) for asset_id in assets_ids])
        if not all(oks):
            raise AssetNotFound()

        # TODO: check if processing requests exist

        project = await self._project_repository.create_project(
            name,
            users_ids,
            assets_ids=assets_ids,
            processing_requests_ids=processing_requests_ids,
            description=description,
        )
        return project

    async def get_project(self, project_id: uuid.UUID) -> Project:
        return await self._project_repository.get_project(project_id)

    async def get_project_users(self, project_id: uuid.UUID) -> list[dict]:
        project = await self._project_repository.get_project(project_id)
        users = await asyncio.gather(*[self._user_manager.get(user_id) for user_id in project.users_ids])
        return users

    async def get_project_assets(self, project_id: uuid.UUID) -> Sequence[Asset]:
        project = await self._project_repository.get_project(project_id)
        return await self._asset_service.get_assets_by_ids(project.assets_ids)

    async def update_project(
        self,
        project_id: uuid.UUID,
        name: Optional[str] = None,
        description: Optional[str] = None,
    ) -> Project:
        return await self._project_repository.update_project(project_id, name, description)

    async def add_user_to_project(self, project_id: uuid.UUID, user_id: uuid.UUID) -> Project:
        try:
            _ = await self._user_manager.get(user_id)
        except UserNotExists:
            raise UserNotFound()

        return await self._project_repository.add_user_to_project(project_id, user_id)

    async def remove_user_from_project(self, project_id: uuid.UUID, user_id: uuid.UUID) -> Project:
        try:
            _ = await self._user_manager.get(user_id)
        except UserNotExists:
            raise UserNotFound()

        project = await self._project_repository.get_project(project_id)
        if len(project.users_ids) == 1:
            raise LastUserInProject()
        elif len(project.users_ids) <= 0:
            raise ProjectHasNoUsers()

        return await self._project_repository.remove_user_from_project(project_id, user_id)

    async def add_asset_to_project(self, project_id: uuid.UUID, asset_id: uuid.UUID) -> Project:
        ok = await self._asset_service.does_asset_exist(asset_id)
        if not ok:
            raise AssetNotFound()

        return await self._project_repository.add_asset_to_project(project_id, asset_id)

    async def remove_asset_from_project(self, project_id: uuid.UUID, asset_id: uuid.UUID) -> Project:
        ok = await self._asset_service.delete_asset(asset_id)
        if not ok:
            raise AssetDeletionFailed()

        # TODO: check if there are any processing requests with this asset

        return await self._project_repository.remove_asset_from_project(project_id, asset_id)

    async def add_processing_request_to_project(
        self, project_id: uuid.UUID, processing_request_id: uuid.UUID
    ) -> Project:
        # TODO: check if processing request exists

        return await self._project_repository.add_processing_request_to_project(project_id, processing_request_id)

    async def delete_project(self, project_id: uuid.UUID) -> None:
        # TODO: cancel processing requests

        assetes_deleted = await self._asset_service.delete_assets_by_project_id(project_id)
        if not assetes_deleted:
            raise AssetDeletionFailed()

        await self._project_repository.delete_project(project_id)

    async def does_user_have_access_to_project(self, user_id: uuid.UUID, project_id: uuid.UUID) -> bool:
        project = await self.get_project(project_id)
        current_user_id = str(user_id)
        project_user_id = [str(user_id) for user_id in project.users_ids]
        return current_user_id in project_user_id


async def get_project_service(
    project_repository: ProjectRepository = Depends(get_project_repository),
    asset_service: AssetService = Depends(get_asset_service),
    user_manager: UserManager = Depends(get_user_manager),
) -> AsyncGenerator[ProjectService, None]:
    yield ProjectService(project_repository, asset_service, user_manager)
