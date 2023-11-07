Migration with Alembic:

```shell
DATABASE_URL="postgresql+asyncpg://postgres:postgres@localhost:5433/files" alembic revision --autogenerate -m "Revision message"
```