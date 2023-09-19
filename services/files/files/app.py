import threading

from fastapi import FastAPI

from .controllers import blobs, files
from .repositories.init_db import migrate_to_latest

app = FastAPI(
    title="PIX Portal Files",
    description="File service for PIX Portal.",
    # TODO: update version programmatically
    version="0.1.0",
)


app.include_router(blobs.router, prefix="/blobs", tags=["blobs"])
app.include_router(
    files.router,
    prefix="/files",
    tags=["files"],
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
