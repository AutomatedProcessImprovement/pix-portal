from pathlib import Path

from pydantic import HttpUrl, PostgresDsn
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    database_url: PostgresDsn
    allowed_origins: str

    # users
    secret_key_file: Path
    superuser_email_file: Path
    superuser_password_file: Path
    system_email_file: Path
    system_password_file: Path
    kafka_topic_email_notifications: str
    frontend_verify_public_url: HttpUrl

    # processing requests
    kafka_bootstrap_servers: str
    kafka_topic_simulation_prosimos: str
    kafka_topic_process_model_optimization_simod: str
    kafka_topic_process_model_optimization_optimos: str
    kafka_topic_waiting_time_analysis_kronos: str

    # files
    base_dir: Path = Path(__file__).parent.parent
    blobs_base_public_url: HttpUrl

    # assets
    blobs_base_internal_url: HttpUrl

    model_config = SettingsConfigDict(env_file=Path(__file__).parent.parent / ".env", extra="allow")


settings = Settings()
