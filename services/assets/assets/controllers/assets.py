import uuid
from typing import Annotated, Any, Optional

from fastapi import APIRouter, Depends, Header, HTTPException

from ..repositories.asset_repository import AssetNotFound
from ..services.asset import AssetService, get_asset_service
from ..services.auth import get_current_user
from .schemas import AssetIn, AssetOut, AssetUpdateIn, LocationOut

router = APIRouter()

# TODO: ensure when a user accesses an asset, they have access to the project it belongs to


@router.get("/", response_model=list[AssetOut])
async def get_assets(
    asset_service: AssetService = Depends(get_asset_service),
    by_project_id: Optional[uuid.UUID] = None,
    by_processing_request_id: Optional[uuid.UUID] = None,
    user: dict = Depends(get_current_user),
) -> list[Any]:
    if by_project_id:
        result = await asset_service.get_assets_by_project_id(by_project_id)
        return result

    if by_processing_request_id:
        result = await asset_service.get_assets_by_processing_request_id(
            by_processing_request_id
        )
        return result

    return await asset_service.get_assets()


@router.post("/", response_model=AssetOut, status_code=201)
async def create_asset(
    asset_data: AssetIn,
    file_service: AssetService = Depends(get_asset_service),
    user: dict = Depends(get_current_user),
) -> Any:
    # TODO: assert file_id exists and not deleted
    # TODO: assert project_id exists and not deleted
    # TODO: assert processing_request_ids exist and not deleted
    return await file_service.create_asset(**asset_data.model_dump())


@router.get("/{asset_id}", response_model=AssetOut)
async def get_asset(
    asset_id: uuid.UUID,
    asset_service: AssetService = Depends(get_asset_service),
    user: dict = Depends(get_current_user),
) -> Any:
    try:
        result = await asset_service.get_asset(asset_id)
        return result
    except AssetNotFound:
        raise HTTPException(status_code=404, detail="Asset not found")


@router.patch("/{asset_id}", response_model=AssetOut)
async def update_asset(
    asset_id: uuid.UUID,
    asset_update_date: AssetUpdateIn,
    asset_service: AssetService = Depends(get_asset_service),
    user: dict = Depends(get_current_user),
) -> Any:
    try:
        result = await asset_service.update_asset(
            asset_id, **asset_update_date.model_dump()
        )
        return result
    except AssetNotFound:
        raise HTTPException(status_code=404, detail="Asset not found")


@router.delete("/{asset_id}", status_code=204)
async def delete_asset(
    asset_id: uuid.UUID,
    authorization: Annotated[str, Header()],
    asset_service: AssetService = Depends(get_asset_service),
    user: dict = Depends(get_current_user),
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
    asset_service: AssetService = Depends(get_asset_service),
    user: dict = Depends(get_current_user),
) -> Any:
    token = authorization.split(" ")[1]
    try:
        url = await asset_service.get_file_location(asset_id, token=token)
        return LocationOut(location=url)
    except AssetNotFound:
        raise HTTPException(status_code=404, detail="Asset not found")
