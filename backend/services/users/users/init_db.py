from pathlib import Path

from alembic import command
from alembic.config import Config

from .db import engine

config_path = Path(__file__).parent.parent / "alembic.ini"
alembic_root = Path(__file__).parent.parent / "alembic"

config = Config(config_path)
config.set_main_option("script_location", str(alembic_root))


async def migrate_to_latest():
    async with engine.begin() as connection:
        await connection.run_sync(_run_upgrade)


def _run_upgrade(connection):
    config.attributes["connection"] = connection
    command.upgrade(config, "head")
