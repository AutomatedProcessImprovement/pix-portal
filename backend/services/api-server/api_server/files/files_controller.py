import uuid
from typing import Annotated, Any, Optional, Sequence

from fastapi import APIRouter, Body, Depends, HTTPException, Response
from fastapi.responses import FileResponse

from api_server.files.model import File, FileType
from api_server.files.schemas import FileOut, LocationOut
from api_server.files.service import FileExists, FileService, get_file_service
from api_server.users.db import User
from api_server.users.users import current_user, current_superuser
from api_server.utils.exceptions.http_exceptions import NotEnoughPermissionsHTTP

router = APIRouter()


@router.post("/", response_model=FileOut, status_code=201)
async def create_file(
    name: str,
    type: FileType,
    content: Annotated[bytes, Body()],
    response: Response,
    file_service: FileService = Depends(get_file_service),
    user: User = Depends(current_user),  # raises 401 if user is not authenticated,
    users_ids: Optional[str] = None,  # list of users ids separated by commas
) -> Any:
    if not type.is_valid():
        raise HTTPException(status_code=400, detail="Invalid file type")

    try:
        if users_ids is None:
            users_ids = [str(user.id)]
        else:
            users_ids = [uuid.UUID(user_id.strip()) for user_id in users_ids.split(",")]
        result = await file_service.save_file(name=name, file_type=type, file_bytes=content, users_ids=users_ids)
        response.status_code = 201
    except FileExists as e:
        result = e.file
        response.status_code = 200
    return result


@router.get("/", response_model=list[FileOut])
async def get_files(
    file_service: FileService = Depends(get_file_service),
    _=Depends(current_superuser),  # raises 401 if user is not authenticated
) -> Sequence[File]:
    result = await file_service.get_files()
    return result


@router.get("/{file_id}", response_model=FileOut)
async def get_file(
    file_id: uuid.UUID,
    file_service: FileService = Depends(get_file_service),
    user: User = Depends(current_user),  # raises 401 if user is not authenticated
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
    user: User = Depends(current_user),  # raises 401 if user is not authenticated
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
    user: User = Depends(current_user),  # raises 401 if user is not authenticated
) -> LocationOut:
    await _raise_no_access(file_service, user, file_id)

    try:
        location = await file_service.get_file_location(file_id)
        return LocationOut(location=location)
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="File not found")


@router.get("/{file_id}/content")
async def get_file_content(
    file_id: uuid.UUID,
    file_service: FileService = Depends(get_file_service),
    user: User = Depends(current_user),  # raises 401 if user is not authenticated
) -> FileResponse:
    await _raise_no_access(file_service, user, file_id)

    try:
        file_path = await file_service.get_file_path(file_id)
        return FileResponse(file_path)
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="File not found")


async def _raise_no_access(file_service: FileService, user: User, file_id: uuid.UUID) -> None:
    if user.is_superuser is True:
        return
    if not await file_service.user_has_access_to_file(user_id=user.id, file_id=file_id):
        raise NotEnoughPermissionsHTTP()
