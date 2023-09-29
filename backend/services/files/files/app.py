import traceback
from pathlib import Path

from fastapi import FastAPI, Request, Depends, HTTPException
from fastapi.responses import JSONResponse
from pix_portal_lib.events.lifecycle_events import on_startup
from pix_portal_lib.exceptions.fastapi_handlers import general_exception_handler, http_exception_handler
from pix_portal_lib.middleware.request_logging import RequestLoggingMiddleware
from pix_portal_lib.open_telemetry_utils import instrument_app
from pix_portal_lib.services.auth import add_user_to_app_state_if_present

from .controllers import blobs, files

app = FastAPI(
    title="PIX Portal Files",
    description="File service for PIX Portal.",
    # TODO: update version programmatically
    version="0.1.0",
    dependencies=[Depends(add_user_to_app_state_if_present)],
)


app.include_router(blobs.router, prefix="/blobs", tags=["blobs"])
app.include_router(
    files.router,
    prefix="/files",
    tags=["files"],
)

app.add_middleware(RequestLoggingMiddleware)
app.add_exception_handler(Exception, general_exception_handler)
app.add_exception_handler(HTTPException, http_exception_handler)


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
async def on_startup_handler():
    alembic_config_path = Path(__file__).parent.parent / "alembic.ini"
    alembic_root_path = Path(__file__).parent.parent / "alembic"
    await on_startup(alembic_config_path, alembic_root_path)


instrument_app(app, service_name="files")
