import logging
import threading
from math import log
from typing import Any

from fastapi import Depends, FastAPI, HTTPException
from fastapi_users import exceptions
from pix_portal_lib.exceptions.fastapi_handlers import general_exception_handler, http_exception_handler
from pix_portal_lib.middleware.request_logging import RequestLoggingMiddleware
from pix_portal_lib.open_telemetry_utils import instrument_app
from pydantic import BaseModel
from starlette.middleware.cors import CORSMiddleware

from .db import User
from .init_db import create_initial_user, create_system_user, migrate_to_latest
from .schemas import UserCreate, UserRead, UserUpdate
from .settings import settings
from .users import UserManager, auth_backend, current_active_user, fastapi_users, get_user_manager

app = FastAPI(
    title="PIX Portal Users",
    description="Users service for PIX Portal.",
    # TODO: update version programmatically
    version="0.2.0",
)

logger = logging.getLogger(__name__)

users_router = fastapi_users.get_users_router(UserRead, UserUpdate)


@users_router.get("/", response_model=UserRead, tags=["users"])
async def get_by_email(
    email: str,
    user: User = Depends(current_active_user),
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


app.include_router(
    fastapi_users.get_auth_router(auth_backend),
    prefix="/auth/jwt",
    tags=["auth"],
)
app.include_router(
    fastapi_users.get_register_router(UserRead, UserCreate),
    prefix="/auth",
    tags=["auth"],
)
app.include_router(
    fastapi_users.get_reset_password_router(),
    prefix="/auth",
    tags=["auth"],
)
app.include_router(
    fastapi_users.get_verify_router(UserRead),
    prefix="/auth",
    tags=["auth"],
)
app.include_router(
    users_router,
    prefix="/users",
    tags=["users"],
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins.split(","),
    allow_methods=["*"],
    allow_headers=["*"],
    allow_credentials=True,
)
app.add_middleware(RequestLoggingMiddleware)
app.add_exception_handler(Exception, general_exception_handler)
app.add_exception_handler(HTTPException, http_exception_handler)


class TokenVerificationResponse(BaseModel):
    status: bool
    user: UserRead


@app.post("/auth/jwt/verify-token", response_model=TokenVerificationResponse, tags=["auth"])
async def verify_token(
    is_superuser: bool,
    user: User = Depends(current_active_user),
) -> Any:
    """
    Verifies a token in the authorization header. It is used by other services to authenticate users.
    If the is_superuser query parameter is set to true, the user must be a superuser.
    """
    if is_superuser:
        if not user.is_superuser:
            raise HTTPException(status_code=401, detail="Invalid authentication token")

    return {"status": True, "user": user}


@app.get("/authenticated-route", tags=["demo"])
async def authenticated_route(user: User = Depends(current_active_user)):
    """
    Example of an authenticated route.
    """
    return {"message": f"Hello {user.email}!"}


@app.on_event("startup")
async def on_startup():
    try:
        # We need the lock to avoid the warning because of concurrent run.
        # See more at https://stackoverflow.com/questions/54351783/duplicate-key-value-violates-unique-constraint-postgres-error-when-trying-to-c
        lock = threading.Lock()
        with lock:
            await migrate_to_latest()
            # initial user is required mostly for demo purposes and debugging
            await create_initial_user()
            # system user is required for services to authenticate themselves
            await create_system_user()
    except Exception as e:
        print(e)


instrument_app(app, service_name="users", httpx=False)
