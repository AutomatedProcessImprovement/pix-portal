from pathlib import Path

from alembic import command
from alembic.config import Config

from api_server.settings import settings

from .create_user import create_user, get_user
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


async def create_initial_user():
    """Creates an initial user for demo purposes."""
    return await _create_user(
        settings.superuser_email_file,
        settings.superuser_password_file,
        "Super",
        "User",
        is_superuser=True,
        is_verified=True,
    )


async def create_system_user():
    """Creates a system user that is used by backend services to authenticate themselves."""
    return await _create_user(
        settings.system_email_file,
        settings.system_password_file,
        "SYSTEM",
        "SYSTEM",
        is_superuser=True,
        is_verified=True,
    )


async def _create_user(
    email_path: Path, password_path: Path, first_name: str, last_name: str, is_superuser: bool, is_verified: bool
):
    if not email_path or not password_path or not email_path.exists() or not password_path.exists():
        print("No credentials provided, skipping creation.")
        return

    email = email_path.read_text().strip()
    password = password_path.read_text().strip()

    existing_user = await get_user(email)
    if existing_user:
        return

    await create_user(
        email, password, first_name=first_name, last_name=last_name, is_superuser=is_superuser, is_verified=is_verified
    )
    print(f"User {email} has been created successfully.")
