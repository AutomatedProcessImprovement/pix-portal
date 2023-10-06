from pathlib import Path

from pydantic import HttpUrl
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    kafka_bootstrap_servers: str
    kafka_topic_requests: str
    kafka_topic_results: str
    kafka_consumer_group_id: str
    asset_service_url: HttpUrl
    asset_base_dir: Path
    prosimos_results_base_dir: Path
    system_username: str
    system_password: str
    auth_service_url: HttpUrl
    file_service_url: HttpUrl
    processing_request_service_url: HttpUrl
    project_service_url: HttpUrl

    model_config = SettingsConfigDict(env_file=Path(__file__).parent.parent / ".env", extra="allow")


settings = Settings()
