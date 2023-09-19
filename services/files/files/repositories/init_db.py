from pathlib import Path

from alembic import command, script
from alembic.config import Config
from alembic.runtime import migration

from .db import engine

config_path = Path(__file__).parent.parent.parent / "alembic.ini"
alembic_root = Path(__file__).parent.parent.parent / "alembic"

config = Config(config_path)
config.set_main_option("script_location", str(alembic_root))


async def migrate_to_latest():
    async with engine.begin() as connection:
        if not await connection.run_sync(_is_at_head):
            await connection.run_sync(_run_upgrade)
        print("Database migration not needed, at head")


def _is_at_head(connection) -> bool:
    directory = script.ScriptDirectory.from_config(config)
    context = migration.MigrationContext.configure(connection)
    return set(context.get_current_heads()) == set(directory.get_heads())


def _run_upgrade(connection):
    config.attributes["connection"] = connection
    command.upgrade(config, "head")
