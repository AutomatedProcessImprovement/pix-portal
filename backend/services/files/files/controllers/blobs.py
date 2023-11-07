from fastapi import APIRouter, Depends
from fastapi.responses import FileResponse
from pix_portal_lib.exceptions.http_exceptions import NotEnoughPermissionsHTTP
from pix_portal_lib.service_clients.fastapi import get_current_user

from files.services.file import FileService, get_file_service

router = APIRouter()


@router.get("/{hash}")
async def get_file_content_by_hash(
    hash: str,
    file_service: FileService = Depends(get_file_service),
    user: dict = Depends(get_current_user),  # raises 401 if user is not authenticated
) -> FileResponse:
    file = await file_service.get_file_by_hash(hash)

    if not await file_service.user_has_access_to_file(user_id=user["id"], file_id=file.id):
        raise NotEnoughPermissionsHTTP()

    file_path = file_service.base_dir / hash

    return FileResponse(file_path)
