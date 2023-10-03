from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    kafka_bootstrap_servers: str
    kafka_topic_requests: str
    kafka_topic_results: str
    kafka_consumer_group_id: str

    model_config = SettingsConfigDict(
        env_file=Path(__file__).parent.parent / ".env", extra="allow"
    )


settings = Settings()
