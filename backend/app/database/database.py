from sqlalchemy import create_engine
from sqlalchemy.engine import URL
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, scoped_session

from app.database.config import settings

Base = declarative_base()
_url = URL.create(
    drivername=settings.DRIVER_NAME,
    username=settings.POSTGRES_USER,
    password=settings.POSTGRES_PASSWORD,
    database=settings.POSTGRES_DB,
    port=settings.DATABASE_PORT,
    host=settings.POSTGRES_HOST
)

print(_url)

engine = create_engine(
    _url, echo=True
)
SessionLocal = scoped_session(sessionmaker(autocommit=False, autoflush=False, bind=engine))


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
