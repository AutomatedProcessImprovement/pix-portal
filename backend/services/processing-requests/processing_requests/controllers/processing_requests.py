import uuid
from typing import Annotated, Any, Optional

from fastapi import APIRouter, Depends, Header
from fastapi.exceptions import HTTPException
from pix_portal_lib.exceptions.http_exceptions import (
    AssetAlreadyExistsHTTP,
    AssetAlreadyInInputAssetsHTTP,
    AssetAlreadyInOutputAssetsHTTP,
    AssetDoesNotBelongToProjectHTTP,
    AssetNotFoundHTTP,
    InvalidAuthorizationHeader,
    NotEnoughPermissionsHTTP,
    ProcessingRequestNotFoundHTTP,
    ProjectNotFoundHTTP,
    UserNotFoundHTTP,
)
from pix_portal_lib.service_clients.fastapi import get_current_user

from .schemas import ProcessingRequestOut, ProcessingRequestIn, PatchProcessingRequest, AssetIn, AssetsOut
from ..persistence.model import ProcessingRequest
from ..persistence.repository import ProcessingRequestNotFound
from ..services.processing_request import (
    ProcessingRequestService,
    get_processing_request_service,
    AssetAlreadyExists,
    AssetNotFound,
    AssetDoesNotBelongToProject,
    UserNotFound,
    ProjectNotFound,
    NotEnoughPermissions,
    AssetAlreadyInOutputAssets,
    QueueNotAvailable,
)

router = APIRouter()


def _get_token(authorization: Annotated[str, Header()]) -> str:
    try:
        return authorization.split(" ")[1]
    except IndexError:
        raise InvalidAuthorizationHeader()


# General API


@router.get("/", response_model=list[ProcessingRequestOut], tags=["processing_requests"])
async def get_processing_requests(
    user_id: Optional[uuid.UUID] = None,
    project_id: Optional[uuid.UUID] = None,
    asset_id: Optional[uuid.UUID] = None,
    input_asset_id: Optional[uuid.UUID] = None,
    output_asset_id: Optional[uuid.UUID] = None,
    processing_request_service: ProcessingRequestService = Depends(get_processing_request_service),
    user: dict = Depends(get_current_user),
    token: str = Depends(_get_token),
) -> Any:
    """
    Get processing requests either by user_id, project_id or asset_id. Superusers can get all processing requests.
    """
    current_user_id = str(user["id"])
    requested_user_id = str(user_id) if user_id is not None else None

    # Processing requests of other users can be accessed only by superusers
    if user_id is not None and current_user_id != requested_user_id:
        _raise_for_not_superuser(user)
        return await processing_request_service.get_processing_requests_by_user_id(user_id)

    if project_id is not None:
        try:
            return await processing_request_service.get_processing_requests_by_project_id(project_id, user, token)
        except NotEnoughPermissions:
            raise NotEnoughPermissionsHTTP()

    if asset_id is not None:
        return await processing_request_service.get_processing_requests_by_asset_id(asset_id)

    if input_asset_id is not None:
        return await processing_request_service.get_processing_requests_by_input_asset_id(input_asset_id)

    if output_asset_id is not None:
        return await processing_request_service.get_processing_requests_by_output_asset_id(output_asset_id)

    return await processing_request_service.get_processing_requests_by_user_id(user["id"])


@router.post("/", response_model=ProcessingRequestOut, tags=["processing_requests"], status_code=201)
async def create_processing_request(
    processing_request_data: ProcessingRequestIn,
    processing_request_service: ProcessingRequestService = Depends(get_processing_request_service),
    user: dict = Depends(get_current_user),
    token: str = Depends(_get_token),
) -> Any:
    """
    Create a processing request for the authenticated user.
    """
    try:
        return await processing_request_service.create_processing_request(
            type=processing_request_data.type,
            user_id=user["id"],
            project_id=processing_request_data.project_id,
            input_assets_ids=processing_request_data.input_assets_ids,
            output_assets_ids=processing_request_data.output_assets_ids,
            token=token,
            current_user=user,
        )
    except UserNotFound:
        raise UserNotFoundHTTP()
    except ProjectNotFound:
        raise ProjectNotFoundHTTP()
    except AssetNotFound as e:
        raise AssetNotFoundHTTP(f"Asset not found: {e.asset_id}")
    except NotEnoughPermissions:
        raise NotEnoughPermissionsHTTP()
    except QueueNotAvailable:
        raise HTTPException(status_code=503, detail="Service Unavailable")


@router.get("/{processing_request_id}", response_model=ProcessingRequestOut, tags=["processing_requests"])
async def get_processing_request(
    processing_request_id: uuid.UUID,
    processing_request_service: ProcessingRequestService = Depends(get_processing_request_service),
    user: dict = Depends(get_current_user),
) -> Any:
    """
    Get a processing request by its id.
    """
    try:
        processing_request = await processing_request_service.get_processing_request(processing_request_id)
    except ProcessingRequestNotFound:
        raise ProcessingRequestNotFoundHTTP()
    _raise_for_no_access_to_processing_request(processing_request, user)
    return processing_request


@router.patch("/{processing_request_id}", response_model=ProcessingRequestOut, tags=["processing_requests"])
async def update_processing_request(
    processing_request_id: uuid.UUID,
    processing_request_data: PatchProcessingRequest,
    processing_request_service: ProcessingRequestService = Depends(get_processing_request_service),
    user: dict = Depends(get_current_user),
) -> Any:
    """
    Patch a processing request by its ID.
    """
    try:
        processing_request = await processing_request_service.get_processing_request(processing_request_id)
    except ProcessingRequestNotFound:
        raise ProcessingRequestNotFoundHTTP()
    _raise_for_no_access_to_processing_request(processing_request, user)
    return await processing_request_service.update_processing_request(
        processing_request_id=processing_request_id,
        **processing_request_data.model_dump(exclude_unset=True),
    )


# Processing requests' assets API


@router.get("/{processing_request_id}/input-assets", response_model=AssetsOut, tags=["processing_requests_assets"])
async def get_input_assets_of_processing_request(
    processing_request_id: uuid.UUID,
    processing_request_service: ProcessingRequestService = Depends(get_processing_request_service),
    user: dict = Depends(get_current_user),
) -> Any:
    """
    Get the input assets of a processing request.
    """
    try:
        processing_request = await processing_request_service.get_processing_request(processing_request_id)
    except ProcessingRequestNotFound:
        raise ProcessingRequestNotFoundHTTP()
    _raise_for_no_access_to_processing_request(processing_request, user)
    response = AssetsOut(assets=processing_request.input_assets_ids)
    return response


@router.post(
    "/{processing_request_id}/input-assets", response_model=ProcessingRequestOut, tags=["processing_requests_assets"]
)
async def add_input_asset_to_processing_request(
    processing_request_id: uuid.UUID,
    input_asset_data: AssetIn,
    processing_request_service: ProcessingRequestService = Depends(get_processing_request_service),
    user: dict = Depends(get_current_user),
    token: str = Depends(_get_token),
) -> Any:
    """
    Add an input asset to a processing request.
    """
    try:
        processing_request = await processing_request_service.get_processing_request(processing_request_id)
    except ProcessingRequestNotFound:
        raise ProcessingRequestNotFoundHTTP()
    _raise_for_no_access_to_processing_request(processing_request, user)
    try:
        return await processing_request_service.add_input_asset_to_processing_request(
            processing_request_id=processing_request_id,
            asset_id=input_asset_data.asset_id,
            token=token,
        )
    except AssetNotFound as e:
        raise AssetNotFoundHTTP(f"Asset not found: {e.asset_id}")
    except AssetDoesNotBelongToProject:
        raise AssetDoesNotBelongToProjectHTTP()
    except AssetAlreadyExists:
        raise AssetAlreadyExistsHTTP()
    except AssetAlreadyInOutputAssets:
        raise AssetAlreadyInOutputAssetsHTTP()


@router.get("/{processing_request_id}/output-assets", response_model=AssetsOut, tags=["processing_requests_assets"])
async def get_output_assets_of_processing_request(
    processing_request_id: uuid.UUID,
    processing_request_service: ProcessingRequestService = Depends(get_processing_request_service),
    user: dict = Depends(get_current_user),
) -> Any:
    """
    Get the output assets of a processing request.
    """
    try:
        processing_request = await processing_request_service.get_processing_request(processing_request_id)
    except ProcessingRequestNotFound:
        raise ProcessingRequestNotFoundHTTP()
    _raise_for_no_access_to_processing_request(processing_request, user)
    response = AssetsOut(assets=processing_request.output_assets_ids)
    return response


@router.post(
    "/{processing_request_id}/output-assets", response_model=ProcessingRequestOut, tags=["processing_requests_assets"]
)
async def add_output_asset_to_processing_request(
    processing_request_id: uuid.UUID,
    output_asset_data: AssetIn,
    processing_request_service: ProcessingRequestService = Depends(get_processing_request_service),
    user: dict = Depends(get_current_user),
    token: str = Depends(_get_token),
) -> Any:
    """
    Add an output asset to a processing request.
    """
    try:
        processing_request = await processing_request_service.get_processing_request(processing_request_id)
    except ProcessingRequestNotFound:
        raise ProcessingRequestNotFoundHTTP()
    _raise_for_no_access_to_processing_request(processing_request, user)
    try:
        return await processing_request_service.add_output_asset_to_processing_request(
            processing_request_id=processing_request_id,
            asset_id=output_asset_data.asset_id,
            token=token,
        )
    except AssetNotFound as e:
        raise AssetNotFoundHTTP(f"Asset not found: {e.asset_id}")
    except AssetDoesNotBelongToProject:
        raise AssetDoesNotBelongToProjectHTTP()
    except AssetAlreadyExists:
        raise AssetAlreadyExistsHTTP()
    except AssetAlreadyInOutputAssets:
        raise AssetAlreadyInInputAssetsHTTP()


def _raise_for_no_access_to_processing_request(processing_request: ProcessingRequest, user: dict) -> None:
    if user["is_superuser"]:
        return

    processing_request_user_id = str(processing_request.user_id)
    user_id = str(user["id"])
    if user_id != processing_request_user_id:
        raise NotEnoughPermissionsHTTP()


def _raise_for_not_superuser(user: dict) -> None:
    if not user["is_superuser"]:
        raise NotEnoughPermissionsHTTP()
