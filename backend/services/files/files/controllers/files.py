import uuid
from typing import Annotated, Any

from fastapi import APIRouter, Body, Depends, HTTPException, UploadFile
from fastapi.responses import FileResponse
from pix_portal_lib.services.auth import get_current_superuser, get_current_user

from .schemas import FileOut, LocationOut
from ..services.file import FileService, get_file_service

router = APIRouter()


@router.post("/", response_model=FileOut, status_code=201)
async def create_file(
    file_bytes: Annotated[bytes, Body()],
    file_service: FileService = Depends(get_file_service),
    user: dict = Depends(get_current_user),
) -> Any:
    result = await file_service.save_file(file_bytes)
    return result


@router.post("/upload", response_model=FileOut)
async def upload_file(
    upload: UploadFile,
    file_service: FileService = Depends(get_file_service),
    user: dict = Depends(get_current_user),
) -> Any:
    result = await file_service.save_file(upload.file.read())
    return result


@router.get("/", response_model=list[FileOut])
async def get_files(
    file_service: FileService = Depends(get_file_service),
    user: dict = Depends(get_current_superuser),
) -> list[Any]:
    result = await file_service.get_files()
    return result


@router.get("/{file_id}", response_model=FileOut)
async def get_file(
    file_id: uuid.UUID,
    file_service: FileService = Depends(get_file_service),
    user: dict = Depends(get_current_user),
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
    user: dict = Depends(get_current_user),
) -> None:
    try:
        await file_service.delete_file(file_id)
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="File not found")


@router.get("/{file_id}/location")
async def get_file_location(
    file_id: uuid.UUID,
    file_service: FileService = Depends(get_file_service),
    user: dict = Depends(get_current_user),
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
    user: dict = Depends(get_current_user),
) -> FileResponse:
    try:
        file_path = await file_service.get_file_path(file_id)
        return FileResponse(file_path)
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="File not found")
