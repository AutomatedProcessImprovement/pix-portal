from pathlib import Path

from alembic import command
from alembic.config import Config
from users.create_user import create_user, get_user

from .db import engine
from .settings import settings

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
    if not settings.superuser_email_file or not settings.superuser_password_file:
        print("No superuser credentials provided, skipping creation.")
        return

    email = settings.superuser_email_file.read_text().strip()
    password = settings.superuser_password_file.read_text().strip()
    first_name = "Super"
    last_name = "User"

    existing_user = await get_user(email)
    if existing_user:
        return

    await create_user(email, password, first_name=first_name, last_name=last_name, is_superuser=True, is_verified=True)
    print("Superuser created successfully.")
