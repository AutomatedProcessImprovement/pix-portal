import uuid
from typing import Annotated, Any, Optional, Sequence

from fastapi import APIRouter, Depends, Header

from api_server.projects.model import Project
from api_server.projects.repository import ProjectNotFound
from api_server.projects.schemas import (
    AddAssetToProjectIn,
    AddUserToProjectIn,
    AssetOut,
    ProjectIn,
    ProjectOut,
    ProjectPatchIn,
)
from api_server.projects.service import (
    AssetNotFound,
    ProjectService,
    UserNotFound,
    get_project_service,
)
from api_server.users.db import User
from api_server.users.users import current_user, current_superuser
from api_server.utils.exceptions.http_exceptions import (
    AssetNotFoundHTTP,
    InvalidAuthorizationHeader,
    NotEnoughPermissionsHTTP,
    ProjectNotFoundHTTP,
    UserNotFoundHTTP,
)

router = APIRouter()


def _get_token(authorization: Annotated[str, Header()]) -> str:
    try:
        return authorization.split(" ")[1]
    except IndexError:
        raise InvalidAuthorizationHeader()


# General API


@router.get("/", response_model=list[ProjectOut], tags=["projects"])
async def get_projects(
    user_id: Optional[uuid.UUID] = None,
    project_service: ProjectService = Depends(get_project_service),
    _=Depends(current_superuser),  # raises 401 if user is not authenticated
) -> Sequence[Project]:
    if user_id:
        return await project_service.get_projects_by_user_id(user_id)
    return await project_service.get_projects()


@router.post("/", response_model=ProjectOut, status_code=201, tags=["projects"])
async def create_project(
    project_data: ProjectIn,
    project_service: ProjectService = Depends(get_project_service),
    user: User = Depends(current_user),
) -> Any:
    try:
        return await project_service.create_project(**project_data.model_dump(), current_user=user.__dict__)
    except AssetNotFound:
        raise AssetNotFoundHTTP()
    except UserNotFound:
        raise UserNotFoundHTTP()


@router.get("/{project_id}", response_model=ProjectOut, tags=["projects"])
async def get_project(
    project_id: uuid.UUID,
    project_service: ProjectService = Depends(get_project_service),
    user: User = Depends(current_user),
) -> Any:
    try:
        project = await project_service.get_project(project_id)
        _raise_for_no_access_to_project(project, user)
        return project
    except ProjectNotFound:
        raise ProjectNotFoundHTTP()


@router.patch("/{project_id}", response_model=ProjectOut, tags=["projects"])
async def patch_project(
    project_id: uuid.UUID,
    project_update_data: ProjectPatchIn,
    project_service: ProjectService = Depends(get_project_service),
    user: User = Depends(current_user),
) -> Any:
    try:
        project = await project_service.get_project(project_id)
        _raise_for_no_access_to_project(project, user)
        return await project_service.update_project(project_id, **project_update_data.model_dump(exclude_none=True))
    except ProjectNotFound:
        raise ProjectNotFoundHTTP()


@router.delete("/{project_id}", status_code=204, tags=["projects"])
async def delete_project(
    project_id: uuid.UUID,
    project_service: ProjectService = Depends(get_project_service),
    user: User = Depends(current_user),
    token: str = Depends(_get_token),
) -> None:
    try:
        project = await project_service.get_project(project_id)
        _raise_for_no_access_to_project(project, user)
        await project_service.delete_project(project_id)
    except ProjectNotFound:
        raise ProjectNotFoundHTTP()


# Project users API


@router.get("/{project_id}/users", response_model=list[dict], tags=["project_users"])
async def get_project_users(
    project_id: uuid.UUID,
    project_service: ProjectService = Depends(get_project_service),
    user: User = Depends(current_user),
    token: str = Depends(_get_token),
) -> Any:
    try:
        project = await project_service.get_project(project_id)
        _raise_for_no_access_to_project(project, user)
        return await project_service.get_project_users(project_id)
    except ProjectNotFound:
        raise ProjectNotFoundHTTP()


@router.post("/{project_id}/users", response_model=ProjectOut, tags=["project_users"])
async def add_user_to_project(
    project_id: uuid.UUID,
    user_data: AddUserToProjectIn,
    project_service: ProjectService = Depends(get_project_service),
    user: User = Depends(current_user),
    token: str = Depends(_get_token),
) -> Any:
    try:
        project = await project_service.get_project(project_id)
        _raise_for_no_access_to_project(project, user)
        return await project_service.add_user_to_project(project_id, user_data.user_id)
    except ProjectNotFound:
        raise ProjectNotFoundHTTP()
    except UserNotFound:
        raise UserNotFoundHTTP()


@router.delete("/{project_id}/users/{user_id}", response_model=ProjectOut, tags=["project_users"])
async def remove_user_from_project(
    project_id: uuid.UUID,
    user_id: uuid.UUID,
    project_service: ProjectService = Depends(get_project_service),
    user: User = Depends(current_user),
    token: str = Depends(_get_token),
) -> Any:
    try:
        project = await project_service.get_project(project_id)
        _raise_for_no_access_to_project(project, user)
        return await project_service.remove_user_from_project(project_id, user_id)
    except ProjectNotFound:
        raise ProjectNotFoundHTTP()
    except UserNotFound:
        raise UserNotFoundHTTP()


# Project assets API


@router.get("/{project_id}/assets", response_model=list[AssetOut], tags=["project_assets"])
async def get_project_assets(
    project_id: uuid.UUID,
    project_service: ProjectService = Depends(get_project_service),
    user: User = Depends(current_user),
    token: str = Depends(_get_token),
) -> Any:
    try:
        project = await project_service.get_project(project_id)
        _raise_for_no_access_to_project(project, user)
        return await project_service.get_project_assets(project_id)
    except ProjectNotFound:
        raise ProjectNotFoundHTTP()


@router.post("/{project_id}/assets", response_model=ProjectOut, tags=["project_assets"])
async def add_asset_to_project(
    project_id: uuid.UUID,
    asset_data: AddAssetToProjectIn,
    project_service: ProjectService = Depends(get_project_service),
    user: User = Depends(current_user),
    token: str = Depends(_get_token),
) -> Any:
    try:
        project = await project_service.get_project(project_id)
        _raise_for_no_access_to_project(project, user)
        return await project_service.add_asset_to_project(project_id, asset_data.asset_id)
    except ProjectNotFound:
        raise ProjectNotFoundHTTP()
    except AssetNotFound:
        raise AssetNotFoundHTTP()


@router.delete(
    "/{project_id}/assets/{asset_id}",
    response_model=ProjectOut,
    tags=["project_assets"],
)
async def remove_asset_from_project(
    project_id: uuid.UUID,
    asset_id: uuid.UUID,
    project_service: ProjectService = Depends(get_project_service),
    user: User = Depends(current_user),
    token: str = Depends(_get_token),
) -> Any:
    try:
        project = await project_service.get_project(project_id)
        _raise_for_no_access_to_project(project, user)
        return await project_service.remove_asset_from_project(project_id, asset_id)
    except ProjectNotFound:
        raise ProjectNotFoundHTTP()
    except AssetNotFound:
        raise AssetNotFoundHTTP()


def _raise_for_no_access_to_project(project: Project, user: User) -> None:
    if user.is_superuser:
        return

    project_user_ids = [str(uid) for uid in project.users_ids]
    user_id = str(user.id)
    if user_id not in project_user_ids:
        raise NotEnoughPermissionsHTTP()
