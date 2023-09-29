from pathlib import Path

from alembic import command, script
from alembic.config import Config
from alembic.runtime import migration

from .helpers import engine


async def migrate_to_latest(alembic_config_path: Path, alembic_root_path: Path):
    """
    Migrate the database to the latest version.
    """
    config = Config(alembic_config_path)
    config.set_main_option("script_location", str(alembic_root_path))

    async with engine.begin() as connection:
        if not await connection.run_sync(_is_at_head, config=config):
            await connection.run_sync(_run_upgrade, config=config)
        print("Database migration not needed, at head")


def _is_at_head(connection, config: Config) -> bool:
    directory = script.ScriptDirectory.from_config(config)
    context = migration.MigrationContext.configure(connection)
    return set(context.get_current_heads()) == set(directory.get_heads())


def _run_upgrade(connection, config: Config):
    config.attributes["connection"] = connection
    command.upgrade(config, "head")
