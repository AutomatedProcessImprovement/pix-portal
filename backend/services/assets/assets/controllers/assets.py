import uuid
from typing import Annotated, Any, Optional, Sequence

from fastapi import APIRouter, Depends, Header, HTTPException
from pix_portal_lib.exceptions.http_exceptions import (
    NotEnoughPermissionsHTTP,
)
from pix_portal_lib.service_clients.fastapi import get_current_user

from .schemas import AssetIn, AssetOut, AssetPatchIn, LocationOut
from ..persistence.model import Asset
from ..persistence.repository import AssetNotFound
from ..services.asset import AssetService, get_asset_service

router = APIRouter()

# TODO: ensure when a user accesses an asset, they have access to the project it belongs to
# TODO: check all other services don't return objects that don't belong to user


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
    file_service: AssetService = Depends(get_asset_service),
    _user: dict = Depends(get_current_user),  # raises 401 if user is not authenticated
) -> Any:
    # TODO: assert file_id exists and not deleted
    # TODO: assert project_id exists and not deleted
    # TODO: assert processing_request_ids exist and not deleted
    return await file_service.create_asset(**asset_data.model_dump())


@router.get("/{asset_id}", response_model=AssetOut)
async def get_asset(
    asset_id: uuid.UUID,
    asset_service: AssetService = Depends(get_asset_service),
    _user: dict = Depends(get_current_user),  # raises 401 if user is not authenticated
) -> Any:
    try:
        result = await asset_service.get_asset(asset_id)
        return result
    except AssetNotFound:
        raise HTTPException(status_code=404, detail="Asset not found")


@router.patch("/{asset_id}", response_model=AssetOut)
async def patch_asset(
    asset_id: uuid.UUID,
    asset_data: AssetPatchIn,
    asset_service: AssetService = Depends(get_asset_service),
    _user: dict = Depends(get_current_user),  # raises 401 if user is not authenticated
) -> Any:
    try:
        result = await asset_service.update_asset(asset_id, **asset_data.model_dump(exclude_none=True))
        return result
    except AssetNotFound:
        raise HTTPException(status_code=404, detail="Asset not found")


@router.delete("/{asset_id}", status_code=204)
async def delete_asset(
    asset_id: uuid.UUID,
    authorization: Annotated[str, Header()],
    asset_service: AssetService = Depends(get_asset_service),
    _user: dict = Depends(get_current_user),  # raises 401 if user is not authenticated
) -> None:
    token = authorization.split(" ")[1]
    try:
        await asset_service.delete_asset(asset_id, token=token)
    except AssetNotFound:
        raise HTTPException(status_code=404, detail="Asset not found")


@router.get("/{asset_id}/location", response_model=LocationOut)
async def get_asset_location(
    asset_id: uuid.UUID,
    authorization: Annotated[str, Header()],
    is_internal: bool = False,
    asset_service: AssetService = Depends(get_asset_service),
    _user: dict = Depends(get_current_user),  # raises 401 if user is not authenticated
) -> Any:
    token = authorization.split(" ")[1]
    try:
        url = await asset_service.get_file_location(asset_id, is_internal=is_internal, token=token)
        return LocationOut(location=url)
    except AssetNotFound:
        raise HTTPException(status_code=404, detail="Asset not found")


def _raise_for_not_superuser(user: dict) -> None:
    if not user["is_superuser"]:
        raise NotEnoughPermissionsHTTP()
