import os

from dotenv import load_dotenv
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
        load_dotenv(".env")
        print(os.getenv("ENV_PATH"))
        if os.getenv("ENV_PATH") == 'local.env':
            env_file = f"{os.path.dirname(os.path.abspath(__file__))}\\..\\..\\local.env"
            load_dotenv("local.env")
        elif os.getenv("ENV_PATH") == 'prod.env':
            env_file = f"{os.path.dirname(os.path.abspath(__file__))}\\..\\..\\prod.env"
            load_dotenv("prod.env")


settings = Settings()
