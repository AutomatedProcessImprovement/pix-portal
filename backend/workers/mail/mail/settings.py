from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    kafka_bootstrap_servers: str
    kafka_topic_requests: str
    kafka_consumer_group_id: str
    gmail_username_file: str
    gmail_app_password_file: str

    model_config = SettingsConfigDict(env_file=Path(__file__).parent.parent / ".env", extra="allow")


settings = Settings()
