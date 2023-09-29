from pathlib import Path

from pydantic import HttpUrl, PostgresDsn
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    database_url: PostgresDsn
    jwt_verification_url: HttpUrl
    asset_service_url: HttpUrl
    user_service_url: HttpUrl
    project_service_url: HttpUrl
    kafka_bootstrap_servers: str
    kafka_topic_simulation_prosimos: str
    kafka_topic_process_model_optimization_simod: str
    kafka_topic_process_model_optimization_optimos: str
    kafka_topic_waiting_time_analysis_kronos: str

    model_config = SettingsConfigDict(
        env_file=Path(__file__).parent.parent / ".env", extra="allow"
    )


settings = Settings()
