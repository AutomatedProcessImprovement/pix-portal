import logging

from fastapi import Depends, HTTPException
from fastapi_users import exceptions
from pydantic import BaseModel

from .db import User
from .schemas import UserRead, UserUpdate
from .users import UserManager, auth_backend, current_active_user, fastapi_users, get_user_manager

logger = logging.getLogger(__name__)

users_router = fastapi_users.get_users_router(UserRead, UserUpdate)


@users_router.get("/", response_model=UserRead)
async def get_by_email(
    email: str,
    manager: UserManager = Depends(get_user_manager),
):
    if not email:
        raise HTTPException(status_code=400, detail="Email is required")
    try:
        user = await manager.get_by_email(email)
    except exceptions.UserNotExists:
        raise HTTPException(status_code=404, detail="User not found")
    except Exception as e:
        logger.exception(f"Error getting user by email: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")
    return user


jwt_router = fastapi_users.get_auth_router(auth_backend)


class TokenVerificationResponse(BaseModel):
    status: bool
    user: UserRead


@jwt_router.post("/verify-token", response_model=TokenVerificationResponse)
async def verify_token(
    is_superuser: bool,
    user: User = Depends(current_active_user),
) -> any:
    """
    Verifies a token in the authorization header. It is used by other services to authenticate users.
    If the is_superuser query parameter is set to true, the user must be a superuser.
    """
    if is_superuser:
        if not user.is_superuser:
            raise HTTPException(status_code=401, detail="Invalid authentication token")

    return {"status": True, "user": user}
