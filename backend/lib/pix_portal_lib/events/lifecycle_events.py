import threading
from pathlib import Path

from ..database.migration import migrate_to_latest


async def on_startup(alembic_config_path: Path, alembic_root_path: Path) -> None:
    """
    Handles the startup event of the FastAPI application.
    """
    try:
        # We need the lock to avoid the warning because of concurrent run.
        # See more at https://stackoverflow.com/questions/54351783/duplicate-key-value-violates-unique-constraint-postgres-error-when-trying-to-c
        lock = threading.Lock()
        with lock:
            await migrate_to_latest(alembic_config_path, alembic_root_path)
    except Exception as e:
        print(e)
