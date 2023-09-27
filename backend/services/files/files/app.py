import threading
import traceback

from fastapi import FastAPI, Request, Depends
from fastapi.responses import JSONResponse
from pix_portal_lib.middleware.request_logging import RequestLoggingMiddleware
from pix_portal_lib.open_telemetry_utils import instrument_app
from pix_portal_lib.services.auth import add_user_to_app_state_if_present

from .controllers import blobs, files
from .repositories.init_db import migrate_to_latest

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
        # We need the lock to avoid the warning because of concurrent run.
        # See more at https://stackoverflow.com/questions/54351783/duplicate-key-value-violates-unique-constraint-postgres-error-when-trying-to-c
        lock = threading.Lock()
        with lock:
            await migrate_to_latest()
    except Exception as e:
        print(e)


instrument_app(app, service_name="files")
