from pathlib import Path

from pydantic import HttpUrl, PostgresDsn
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    database_url: PostgresDsn
    jwt_verification_url: HttpUrl
    asset_service_url: HttpUrl
    user_service_url: HttpUrl
    project_service_url: HttpUrl

    model_config = SettingsConfigDict(
        env_file=Path(__file__).parent.parent / ".env", extra="allow"
    )


settings = Settings()
