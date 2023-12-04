import contextlib

from fastapi_users.exceptions import UserAlreadyExists

from users.db import get_async_session, get_users_db
from users.schemas import UserCreate
from users.users import get_user_manager

get_async_session_context = contextlib.asynccontextmanager(get_async_session)
get_user_db_context = contextlib.asynccontextmanager(get_users_db)
get_user_manager_context = contextlib.asynccontextmanager(get_user_manager)


async def create_user(
    email: str,
    password: str,
    first_name: str,
    last_name: str,
    is_superuser: bool = False,
    is_verified: bool = True,
):
    try:
        async with get_async_session_context() as session:
            async with get_user_db_context(session) as user_db:
                async with get_user_manager_context(user_db) as user_manager:
                    user = await user_manager.create(
                        UserCreate(
                            email=email,
                            password=password,
                            first_name=first_name,
                            last_name=last_name,
                            is_superuser=is_superuser,
                            is_verified=is_verified,
                        )
                    )
                    print(f"User {user.id} created successfully.")
    except UserAlreadyExists:
        print(f"User with email {email} already exists.")
    except Exception as e:
        print(f"Error creating user: {e}")


async def does_user_exist(email: str):
    try:
        async with get_async_session_context() as session:
            async with get_user_db_context(session) as user_db:
                async with get_user_manager_context(user_db) as user_manager:
                    user = await user_manager.get_by_email(email)
                    return user is not None
    except Exception as e:
        print(f"Error getting user: {e}")


async def get_user(email: str):
    try:
        async with get_async_session_context() as session:
            async with get_user_db_context(session) as user_db:
                async with get_user_manager_context(user_db) as user_manager:
                    return await user_manager.get_by_email(email)
    except Exception as e:
        print(f"Error getting user: {e}")
