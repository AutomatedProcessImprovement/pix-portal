import threading

from fastapi import Depends, FastAPI, HTTPException
from pydantic import BaseModel

from .db import User
from .init_db import migrate_to_latest
from .schemas import UserCreate, UserRead, UserUpdate
from .users import auth_backend, current_active_user, fastapi_users

app = FastAPI(
    title="PIX Portal Users",
    description="Users service for PIX Portal",
    # TODO: update version programmatically
    version="0.2.0",
)

app.include_router(
    fastapi_users.get_auth_router(auth_backend),
    prefix="/auth/jwt",
)
app.include_router(
    fastapi_users.get_register_router(UserRead, UserCreate),
    prefix="/auth",
)
app.include_router(
    fastapi_users.get_reset_password_router(),
    prefix="/auth",
)
app.include_router(
    fastapi_users.get_verify_router(UserRead),
    prefix="/auth",
)
app.include_router(
    fastapi_users.get_users_router(UserRead, UserUpdate), prefix="/users"
)


class TokenVerificationResponse(BaseModel):
    status: bool
    user: User


@app.post("/auth/jwt/verify-token")
async def verify_token(
    is_superuser: bool,
    user: User = Depends(current_active_user),
) -> TokenVerificationResponse:
    """
    Verifies a token in the authorization header. It is used by other services to authenticate users.
    If the is_superuser query parameter is set to true, the user must be a superuser.
    """
    if is_superuser:
        if not user.is_superuser:
            raise HTTPException(status_code=401, detail="Invalid authentication token")

    response = TokenVerificationResponse(status=True, user=user)
    return response


@app.get("/authenticated-route")
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
    except Exception as e:
        print(e)
