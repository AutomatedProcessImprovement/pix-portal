import uuid

from fastapi import APIRouter, Depends, UploadFile
from fastapi.responses import FileResponse

from ..repositories.models import File
from ..services.auth import get_current_superuser, get_current_user
from ..services.file import FileService, get_file_service

router = APIRouter()


@router.post("/")
async def create_file(
    file_bytes: bytes,
    file_service: FileService = Depends(get_file_service),
    user: dict = Depends(get_current_user),
) -> File:
    print(f"User {user['email']} is creating a file")
    await file_service.save_file(file_bytes)


@router.post("/upload")
async def upload_file(
    uploaded_file: UploadFile = File(...),
    file_service: FileService = Depends(get_file_service),
    user: dict = Depends(get_current_user),
) -> File:
    print(f"User {user['email']} is uploading a file")
    await file_service.save_file(uploaded_file.file.read())


@router.get("/")
async def get_files(
    file_service: FileService = Depends(get_file_service),
    user: dict = Depends(get_current_superuser),
) -> list[File]:
    return await file_service.get_files()


@router.get("/{file_id}")
async def get_file(
    file_id: uuid.UUID,
    file_service: FileService = Depends(get_file_service),
    user: dict = Depends(get_current_user),
) -> File:
    return await file_service.get_file(file_id)


@router.delete("/{file_id}")
async def delete_file(
    file_id: uuid.UUID,
    file_service: FileService = Depends(get_file_service),
    user: dict = Depends(get_current_user),
) -> None:
    await file_service.delete_file(file_id)


@router.get("/{file_id}/location")
async def get_file_location(
    file_id: uuid.UUID,
    file_service: FileService = Depends(get_file_service),
    user: dict = Depends(get_current_user),
) -> str:
    return await file_service.get_file_url(file_id)


@router.get("/{file_id}/content")
async def get_file_content(
    file_id: uuid.UUID,
    file_service: FileService = Depends(get_file_service),
    user: dict = Depends(get_current_user),
) -> FileResponse:
    file_path = await file_service.get_file_path(file_id)
    return FileResponse(file_path)
