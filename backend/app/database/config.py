import os

from pydantic import BaseSettings


class Settings(BaseSettings):
    DRIVER_NAME: str
    DATABASE_PORT: int
    POSTGRES_PASSWORD: str
    POSTGRES_USER: str
    POSTGRES_DB: str
    POSTGRES_HOST: str

    CLIENT_ORIGIN: str

    class Config:
        env_file = f"{os.path.dirname(os.path.abspath(__file__))}/../../.env"


settings = Settings()
