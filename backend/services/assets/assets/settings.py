from pathlib import Path

from pydantic import HttpUrl, PostgresDsn
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    database_url: PostgresDsn
    auth_service_url: HttpUrl
    file_service_url: HttpUrl
    blobs_base_public_url: HttpUrl
    blobs_base_internal_url: HttpUrl

    model_config = SettingsConfigDict(env_file=Path(__file__).parent.parent / ".env", extra="allow")


settings = Settings()
