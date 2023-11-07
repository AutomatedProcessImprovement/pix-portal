import uuid
from typing import Annotated, Any, Sequence

from fastapi import APIRouter, Body, Depends, HTTPException, Response
from fastapi.responses import FileResponse
from files.persistence.model import FileType, File
from files.services.file import FileService, get_file_service, FileExists
from pix_portal_lib.exceptions.http_exceptions import NotEnoughPermissionsHTTP
from pix_portal_lib.service_clients.fastapi import get_current_user

from .schemas import FileOut, LocationOut

router = APIRouter()


@router.post("/", response_model=FileOut, status_code=201)
async def create_file(
    name: str,
    type: FileType,
    content: Annotated[bytes, Body()],
    response: Response,
    file_service: FileService = Depends(get_file_service),
    user: dict = Depends(get_current_user),  # raises 401 if user is not authenticated,
) -> Any:
    if not type.is_valid():
        raise HTTPException(status_code=400, detail="Invalid file type")

    try:
        users_ids = [uuid.UUID(user["id"])]
        result = await file_service.save_file(name=name, file_type=type, file_bytes=content, users_ids=users_ids)
        response.status_code = 201
    except FileExists as e:
        result = e.file
        response.status_code = 200
    return result


@router.get("/", response_model=list[FileOut])
async def get_files(
    file_service: FileService = Depends(get_file_service),
    user: dict = Depends(get_current_user),  # raises 401 if user is not authenticated
) -> Sequence[File]:
    _raise_for_not_superuser(user)
    result = await file_service.get_files()
    return result


@router.get("/{file_id}", response_model=FileOut)
async def get_file(
    file_id: uuid.UUID,
    file_service: FileService = Depends(get_file_service),
    user: dict = Depends(get_current_user),  # raises 401 if user is not authenticated
) -> Any:
    await _raise_no_access(file_service, user, file_id)

    try:
        result = await file_service.get_file(file_id)
        return result
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="File not found")


@router.delete("/{file_id}", status_code=204)
async def delete_file(
    file_id: uuid.UUID,
    file_service: FileService = Depends(get_file_service),
    user: dict = Depends(get_current_user),  # raises 401 if user is not authenticated
) -> None:
    await _raise_no_access(file_service, user, file_id)

    try:
        await file_service.delete_file(file_id)
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="File not found")


@router.get("/{file_id}/location")
async def get_file_location(
    file_id: uuid.UUID,
    file_service: FileService = Depends(get_file_service),
    user: dict = Depends(get_current_user),  # raises 401 if user is not authenticated
) -> LocationOut:
    await _raise_no_access(file_service, user, file_id)

    try:
        location = await file_service.get_file_url(file_id)
        return LocationOut(location=location)
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="File not found")


@router.get("/{file_id}/content")
async def get_file_content(
    file_id: uuid.UUID,
    file_service: FileService = Depends(get_file_service),
    user: dict = Depends(get_current_user),  # raises 401 if user is not authenticated
) -> FileResponse:
    await _raise_no_access(file_service, user, file_id)

    try:
        file_path = await file_service.get_file_path(file_id)
        return FileResponse(file_path)
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="File not found")


def _raise_for_not_superuser(user: dict) -> None:
    if not user["is_superuser"]:
        raise NotEnoughPermissionsHTTP()


async def _raise_no_access(file_service: FileService, user: dict, file_id: uuid.UUID) -> None:
    if user["is_superuser"] is True:
        return
    if not await file_service.user_has_access_to_file(user_id=user["id"], file_id=file_id):
        raise NotEnoughPermissionsHTTP()
