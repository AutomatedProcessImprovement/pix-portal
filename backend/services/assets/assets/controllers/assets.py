import uuid
from typing import Annotated, Any, Optional, Sequence

from fastapi import APIRouter, Depends, Header, HTTPException
from pix_portal_lib.exceptions.http_exceptions import (
    NotEnoughPermissionsHTTP,
    InvalidAuthorizationHeader,
)
from pix_portal_lib.service_clients.fastapi import get_current_user

from assets.persistence.model import Asset
from assets.persistence.repository import AssetNotFound
from assets.services.asset import AssetService, get_asset_service
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
    asset_service: AssetService = Depends(get_asset_service),
    project_id: Optional[uuid.UUID] = None,
    processing_request_id: Optional[uuid.UUID] = None,
    user: dict = Depends(get_current_user),  # raises 401 if user is not authenticated
) -> Sequence[Asset]:
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
    user: dict = Depends(get_current_user),  # raises 401 if user is not authenticated
    token: str = Depends(_get_token),
) -> Any:
    # TODO: assert project_id exists and not deleted

    request_payload = asset_data.model_dump() | {"token": token}

    if request_payload.get("users_ids") is None:
        users_ids = [uuid.UUID(user["id"])]
        request_payload["users_ids"] = users_ids

    return await asset_service.create_asset(**request_payload)


@router.get("/{asset_id}", response_model=AssetOut)
async def get_asset(
    asset_id: uuid.UUID,
    asset_service: AssetService = Depends(get_asset_service),
    user: dict = Depends(get_current_user),  # raises 401 if user is not authenticated
) -> Any:
    await _raise_no_access(asset_service, user, asset_id)

    try:
        return await asset_service.get_asset(asset_id)
    except AssetNotFound:
        raise HTTPException(status_code=404, detail="Asset not found")


@router.patch("/{asset_id}", response_model=AssetOut)
async def patch_asset(
    asset_id: uuid.UUID,
    asset_data: AssetPatchIn,
    asset_service: AssetService = Depends(get_asset_service),
    user: dict = Depends(get_current_user),  # raises 401 if user is not authenticated
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
    user: dict = Depends(get_current_user),  # raises 401 if user is not authenticated
    token: str = Depends(_get_token),
) -> None:
    await _raise_no_access(asset_service, user, asset_id)

    try:
        await asset_service.delete_asset(asset_id, token=token)
    except AssetNotFound:
        raise HTTPException(status_code=404, detail="Asset not found")


@router.get("/{asset_id}/files/{file_id}/location", response_model=LocationOut)
async def get_asset_location(
    asset_id: uuid.UUID,
    file_id: uuid.UUID,
    is_internal: bool = False,
    asset_service: AssetService = Depends(get_asset_service),
    user: dict = Depends(get_current_user),  # raises 401 if user is not authenticated
    token: str = Depends(_get_token),
) -> Any:
    await _raise_no_access(asset_service, user, asset_id)

    try:
        url = await asset_service.get_file_location(file_id, is_internal=is_internal, token=token)
        return LocationOut(location=url)
    except AssetNotFound:
        raise HTTPException(status_code=404, detail="Asset not found")


def _raise_for_not_superuser(user: dict) -> None:
    if not user["is_superuser"]:
        raise NotEnoughPermissionsHTTP()


async def _raise_no_access(asset_service: AssetService, user: dict, asset_id: uuid.UUID) -> None:
    if user["is_superuser"] is True:
        return
    if not await asset_service.user_has_access_to_asset(user_id=user["id"], asset_id=asset_id):
        raise NotEnoughPermissionsHTTP()
