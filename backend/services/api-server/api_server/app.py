import threading
import traceback
from math import e
from pathlib import Path
from typing import Optional

from dotenv import load_dotenv
from fastapi import Depends, FastAPI, HTTPException, Request
from fastapi.responses import JSONResponse
from starlette.middleware.cors import CORSMiddleware

from api_server.assets.controller import router as assets_router
from api_server.files.blobs_controller import router as blobs_router
from api_server.files.files_controller import router as files_router
from api_server.processing_requests.controller import router as processing_router
from api_server.projects.controller import router as projects_router
from api_server.users.init_db import create_initial_user, create_system_user
from api_server.users.schemas import UserCreate, UserRead
from api_server.users.users import auth_backend, current_optional_user, fastapi_users
from api_server.users.users_controller import users_router
from api_server.utils.exceptions.fastapi_handlers import general_exception_handler, http_exception_handler
from api_server.utils.middleware.request_logging import RequestLoggingMiddleware
from api_server.utils.open_telemetry_utils import instrument_app
from api_server.utils.persistence.alembic import migrate_to_latest

from .settings import settings
from .users.db import User

load_dotenv()


def set_current_user(request: Request, current_user: Optional[User] = Depends(current_optional_user)):
    request.state.current_user = current_user


app = FastAPI(
    title="PIX API",
    description="PIX API Server",
    version="0.1.0",
    dependencies=[Depends(set_current_user)],
)


app.include_router(files_router, prefix="/files", tags=["files"])
app.include_router(blobs_router, prefix="/blobs", tags=["blobs"])
app.include_router(assets_router, prefix="/assets", tags=["assets"])
app.include_router(projects_router, prefix="/projects", tags=["projects"])
app.include_router(processing_router, prefix="/processing-requests", tags=["processing_requests"])
app.include_router(fastapi_users.get_auth_router(auth_backend), prefix="/auth/jwt", tags=["auth"])
app.include_router(fastapi_users.get_register_router(UserRead, UserCreate), prefix="/auth", tags=["auth"])
app.include_router(fastapi_users.get_reset_password_router(), prefix="/auth", tags=["auth"])
app.include_router(fastapi_users.get_verify_router(UserRead), prefix="/auth", tags=["auth"])
app.include_router(users_router, prefix="/users", tags=["users"])

origins = settings.allowed_origins.split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_methods=["*"],
    allow_headers=["*"],
    allow_credentials=True,
)
app.add_middleware(RequestLoggingMiddleware)
app.add_exception_handler(Exception, general_exception_handler)
app.add_exception_handler(HTTPException, http_exception_handler)


@app.middleware("http")
async def set_user_id_in_cookies(request: Request, call_next):
    response = await call_next(request)
    try:
        if request.state.current_user:
            response.set_cookie(key="uid", value=str(request.state.current_user.id))
    except Exception:
        pass
    return response


@app.exception_handler(Exception)
async def exception_handler(request: Request, exc: Exception):
    traceback_str = "".join(traceback.format_exception(etype=type(exc), value=exc, tb=exc.__traceback__))
    return JSONResponse(
        status_code=500,
        content={
            "message": "Internal server error",
            "detail": f"{exc}",
            "traceback": traceback_str,
        },
    )


@app.on_event("startup")
async def on_startup():
    try:
        config_path = Path(__file__).parent.parent / "alembic.ini"
        alembic_root = Path(__file__).parent.parent / "alembic"
        # We need the lock to avoid the warning because of concurrent run.
        # See more at https://stackoverflow.com/questions/54351783/duplicate-key-value-violates-unique-constraint-postgres-error-when-trying-to-c
        lock = threading.Lock()
        with lock:
            await migrate_to_latest(alembic_config_path=config_path, alembic_root_path=alembic_root)
            # initial user is required mostly for demo purposes and debugging
            await create_initial_user()
            # system user is required for services to authenticate themselves
            await create_system_user()
    except Exception as e:
        print(e)


instrument_app(app, service_name="api_server")
