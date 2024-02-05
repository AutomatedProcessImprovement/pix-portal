import uuid
from typing import Annotated, Any, Optional

from fastapi import APIRouter, Depends, Header, HTTPException

from api_server.assets.repository import AssetNotFound
from api_server.assets.service import AssetService, get_asset_service
from api_server.projects.service import ProjectService, get_project_service
from api_server.users.db import User
from api_server.users.users import current_user
from api_server.utils.exceptions.http_exceptions import (
    InvalidAuthorizationHeader,
    NotEnoughPermissionsHTTP,
)

from .schemas import AssetIn, AssetOut, AssetPatchIn, LocationOut

router = APIRouter()


# TODO: check all other services don't return objects that don't belong to user
# TODO: introduce caching for assets and files


def _get_token(authorization: Annotated[str, Header()]) -> str:
    try:
        return authorization.split(" ")[1]
    except IndexError:
        raise InvalidAuthorizationHeader()


@router.get("/", response_model=list[AssetOut])
async def get_assets(
    project_id: Optional[uuid.UUID] = None,
    processing_request_id: Optional[uuid.UUID] = None,
    asset_service: AssetService = Depends(get_asset_service),
    user: User = Depends(current_user),  # raises 401 if user is not authenticated
):
    if project_id:
        result = await asset_service.get_assets_by_project_id(project_id)
        return result

    if processing_request_id:
        result = await asset_service.get_assets_by_processing_request_id(processing_request_id)
        return result

    _raise_for_not_superuser(user)
    return await asset_service.get_assets()


@router.post("/", response_model=AssetOut, status_code=201)
async def create_asset(
    asset_data: AssetIn,
    asset_service: AssetService = Depends(get_asset_service),
    project_service: ProjectService = Depends(get_project_service),
    user: User = Depends(current_user),  # raises 401 if user is not authenticated
) -> Any:
    # TODO: assert project_id exists and not deleted

    request_payload = asset_data.model_dump()
    if request_payload.get("users_ids") is None:
        request_payload["users_ids"] = [user.id]

    asset = await asset_service.create_asset(**request_payload)
    await project_service.add_asset_to_project(asset.project_id, asset.id)

    # return asset with an updated projects_ids field
    return await asset_service.get_asset(asset.id)


@router.get("/{asset_id}", response_model=AssetOut)
async def get_asset(
    asset_id: uuid.UUID,
    lazy: bool = True,
    asset_service: AssetService = Depends(get_asset_service),
    user: User = Depends(current_user),  # raises 401 if user is not authenticated
) -> Any:
    await _raise_no_access(asset_service, user, asset_id)

    try:
        return await asset_service.get_asset(asset_id, lazy=lazy)
    except AssetNotFound:
        raise HTTPException(status_code=404, detail="Asset not found")


@router.patch("/{asset_id}", response_model=AssetOut)
async def patch_asset(
    asset_id: uuid.UUID,
    asset_data: AssetPatchIn,
    asset_service: AssetService = Depends(get_asset_service),
    user: User = Depends(current_user),  # raises 401 if user is not authenticated
) -> Any:
    await _raise_no_access(asset_service, user, asset_id)

    try:
        result = await asset_service.update_asset(asset_id, **asset_data.model_dump(exclude_none=True))
        return result
    except AssetNotFound:
        raise HTTPException(status_code=404, detail="Asset not found")


@router.delete("/{asset_id}", status_code=204)
async def delete_asset(
    asset_id: uuid.UUID,
    asset_service: AssetService = Depends(get_asset_service),
    project_service: ProjectService = Depends(get_project_service),
    user: User = Depends(current_user),  # raises 401 if user is not authenticated
) -> None:
    await _raise_no_access(asset_service, user, asset_id)

    try:
        await asset_service.delete_asset(asset_id)
    except AssetNotFound:
        raise HTTPException(status_code=404, detail="Asset not found")


@router.get("/{asset_id}/files/{file_id}/location", response_model=LocationOut)
async def get_asset_location(
    asset_id: uuid.UUID,
    file_id: uuid.UUID,
    is_internal: bool = False,
    asset_service: AssetService = Depends(get_asset_service),
    user: User = Depends(current_user),  # raises 401 if user is not authenticated
) -> Any:
    await _raise_no_access(asset_service, user, asset_id)

    try:
        url = await asset_service.get_file_location(file_id, is_internal=is_internal)
        return LocationOut(location=url)
    except AssetNotFound:
        raise HTTPException(status_code=404, detail="Asset not found")


def _raise_for_not_superuser(user: User) -> None:
    if not user.is_superuser:
        raise NotEnoughPermissionsHTTP()


async def _raise_no_access(asset_service: AssetService, user: User, asset_id: uuid.UUID) -> None:
    if user.is_superuser is True:
        return
    if not await asset_service.user_has_access_to_asset(user_id=user.id, asset_id=asset_id):
        raise NotEnoughPermissionsHTTP()
