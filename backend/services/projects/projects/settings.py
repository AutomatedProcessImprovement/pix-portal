from pathlib import Path

from pydantic import HttpUrl, PostgresDsn
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    database_url: PostgresDsn
    auth_service_url: HttpUrl
    asset_service_url: HttpUrl
    user_service_url: HttpUrl
    processing_request_service_url: HttpUrl
    allowed_origins: str

    model_config = SettingsConfigDict(env_file=Path(__file__).parent.parent / ".env", extra="allow")


settings = Settings()
