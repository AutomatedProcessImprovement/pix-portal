from fastapi import APIRouter, Depends
from fastapi.responses import FileResponse

from ..services.file import FileService, get_file_service

router = APIRouter()


@router.get("/{hash}")
async def get_file_content_by_hash(
    hash: str, file_service: FileService = Depends(get_file_service)
) -> FileResponse:
    file_path = file_service.base_dir / hash
    return FileResponse(file_path)
