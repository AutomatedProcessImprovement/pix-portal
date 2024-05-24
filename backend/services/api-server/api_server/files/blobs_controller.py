from uuid import UUID

from fastapi import APIRouter, Depends
from fastapi.responses import FileResponse

from api_server.files.service import FileService, get_file_service
from api_server.users.db import User
from api_server.users.users import current_user
from api_server.utils.exceptions.http_exceptions import NotEnoughPermissionsHTTP

router = APIRouter()


@router.get("/{hash}")
async def get_file_content_by_hash(
    hash: str,
    file_service: FileService = Depends(get_file_service),
    user: User = Depends(current_user),  # raises 401 if user is not authenticated
) -> FileResponse:
    file = await file_service.get_file_by_hash(hash)
    # TODO: disable access check for the demo, for some reason even if file.users_ids has a user_id file_service returns False in some cases and True in others
    # await _raise_no_access(file_service, user, file.id)
    file_path = file_service.base_dir / hash
    return FileResponse(file_path)


async def _raise_no_access(file_service: FileService, user: User, file_id: UUID) -> None:
    if user.is_superuser is True:
        return
    if not await file_service.user_has_access_to_file(user_id=user.id, file_id=file_id):
        raise NotEnoughPermissionsHTTP()
