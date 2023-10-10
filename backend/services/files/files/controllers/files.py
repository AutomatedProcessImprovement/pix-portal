import uuid
from typing import Annotated, Any

from fastapi import APIRouter, Body, Depends, HTTPException, UploadFile, Response
from fastapi.responses import FileResponse
from pix_portal_lib.service_clients.fastapi import get_current_user

from .schemas import FileOut, LocationOut
from ..services.file import FileService, get_file_service, FileExists

router = APIRouter()


@router.post("/", response_model=FileOut, status_code=201)
async def create_file(
    file_bytes: Annotated[bytes, Body()],
    response: Response,
    file_service: FileService = Depends(get_file_service),
    _user: dict = Depends(get_current_user),  # raises 401 if user is not authenticated,
) -> Any:
    try:
        result = await file_service.save_file(file_bytes)
        response.status_code = 201
    except FileExists as e:
        result = e.file
        response.status_code = 200
    return result


@router.post("/upload", response_model=FileOut)
async def upload_file(
    upload: UploadFile,
    response: Response,
    file_service: FileService = Depends(get_file_service),
    _user: dict = Depends(get_current_user),  # raises 401 if user is not authenticated
) -> Any:
    try:
        result = await file_service.save_file(upload.file.read())
        response.status_code = 201
    except FileExists as e:
        result = e.file
        response.status_code = 200
    return result


@router.get("/", response_model=list[FileOut])
async def get_files(
    file_service: FileService = Depends(get_file_service),
    _user: dict = Depends(get_current_user),  # raises 401 if user is not authenticated
) -> list[Any]:
    result = await file_service.get_files()
    return result


@router.get("/{file_id}", response_model=FileOut)
async def get_file(
    file_id: uuid.UUID,
    file_service: FileService = Depends(get_file_service),
    _user: dict = Depends(get_current_user),  # raises 401 if user is not authenticated
) -> Any:
    try:
        result = await file_service.get_file(file_id)
        return result
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="File not found")


@router.delete("/{file_id}", status_code=204)
async def delete_file(
    file_id: uuid.UUID,
    file_service: FileService = Depends(get_file_service),
    _user: dict = Depends(get_current_user),  # raises 401 if user is not authenticated
) -> None:
    try:
        await file_service.delete_file(file_id)
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="File not found")


@router.get("/{file_id}/location")
async def get_file_location(
    file_id: uuid.UUID,
    file_service: FileService = Depends(get_file_service),
    _user: dict = Depends(get_current_user),  # raises 401 if user is not authenticated
) -> LocationOut:
    try:
        location = await file_service.get_file_url(file_id)
        return LocationOut(location=location)
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="File not found")


@router.get("/{file_id}/content")
async def get_file_content(
    file_id: uuid.UUID,
    file_service: FileService = Depends(get_file_service),
    _user: dict = Depends(get_current_user),  # raises 401 if user is not authenticated
) -> FileResponse:
    try:
        file_path = await file_service.get_file_path(file_id)
        return FileResponse(file_path)
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="File not found")
