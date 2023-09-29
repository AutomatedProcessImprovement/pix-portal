from pathlib import Path
from typing import Any

from fastapi import Depends, FastAPI, HTTPException
from pix_portal_lib.events.lifecycle_events import on_startup
from pix_portal_lib.exceptions.fastapi_handlers import general_exception_handler, http_exception_handler
from pix_portal_lib.middleware.request_logging import RequestLoggingMiddleware
from pix_portal_lib.open_telemetry_utils import instrument_app
from pydantic import BaseModel

from .db import User
from .schemas import UserCreate, UserRead, UserUpdate
from .users import auth_backend, current_active_user, fastapi_users

app = FastAPI(
    title="PIX Portal Users",
    description="Users service for PIX Portal.",
    # TODO: update version programmatically
    version="0.2.0",
)

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
    fastapi_users.get_users_router(UserRead, UserUpdate),
    prefix="/users",
    tags=["users"],
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
async def on_startup_handler():
    alembic_config_path = Path(__file__).parent.parent / "alembic.ini"
    alembic_root_path = Path(__file__).parent.parent / "alembic"
    await on_startup(alembic_config_path, alembic_root_path)


instrument_app(app, service_name="users", httpx=False)
