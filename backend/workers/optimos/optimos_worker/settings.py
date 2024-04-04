from pathlib import Path

from pydantic import HttpUrl
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    kafka_bootstrap_servers: str
    kafka_topic_requests: str
    kafka_topic_results: str
    kafka_topic_cancellations: str
    kafka_consumer_group_id: str
    kafka_topic_email_notifications: str
    asset_service_url: HttpUrl
    asset_base_dir: Path
    optimos_results_base_dir: Path
    system_email_file: Path
    system_password_file: Path
    auth_service_url: HttpUrl
    file_service_url: HttpUrl
    processing_request_service_url: HttpUrl
    project_service_url: HttpUrl

    model_config = SettingsConfigDict(env_file=Path(__file__).parent.parent / ".env", extra="allow")


settings = Settings()
