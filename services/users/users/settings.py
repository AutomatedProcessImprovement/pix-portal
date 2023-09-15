from pathlib import Path

from pydantic import Field, PostgresDsn
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    database_url: PostgresDsn
    secret_key: str

    model_config = SettingsConfigDict(
        env_file=Path(__file__).parent.parent / ".env", extra="allow"
    )


settings = Settings()
