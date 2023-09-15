import threading

from fastapi import Depends, FastAPI

from .db import User
from .init_db import migrate_to_latest
from .schemas import UserCreate, UserRead, UserUpdate
from .users import auth_backend, current_active_user, fastapi_users

app = FastAPI()

app.include_router(
    fastapi_users.get_auth_router(auth_backend), prefix="/auth/jwt", tags=["auth"]
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


@app.get("/authenticated-route")
async def authenticated_route(user: User = Depends(current_active_user)):
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
