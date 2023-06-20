from sqlalchemy.orm import declarative_base, scoped_session, sessionmaker
from sqlalchemy import create_engine
from sqlalchemy.engine import URL

Base = declarative_base()
_url = URL.create(
    drivername='postgresql',
    username='postgres',
    password='postgres',
    database='pix',
    port=5432,
    host='localhost'
)
print(_url)

engine = create_engine(_url, echo=True)

db_session = scoped_session(
    sessionmaker(
        bind=engine,
        autocommit=False,
        autoflush=False
    )
)

