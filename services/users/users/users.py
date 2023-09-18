import uuid
from datetime import datetime
from typing import Any, Dict, Optional

from fastapi import Depends, Request, Response
from fastapi_users import BaseUserManager, FastAPIUsers, UUIDIDMixin
from fastapi_users.authentication import (
    AuthenticationBackend,
    BearerTransport,
    JWTStrategy,
)
from fastapi_users.db import SQLAlchemyUserDatabase

from .db import User, get_user_db
from .settings import settings

SECRET = settings.secret_key


class UserManager(UUIDIDMixin, BaseUserManager[User, uuid.UUID]):
    reset_password_token_secret = SECRET
    verification_token_secret = SECRET

    async def on_after_register(self, user: User, request: Optional[Request] = None):
        timestamp = datetime.utcnow()
        await self.user_db.update(user, {"creation_time": timestamp})

    async def on_after_update(
        self, user: User, update_dict: Dict[str, Any], request: Optional[Request] = None
    ):
        timestamp = datetime.utcnow()
        await self.user_db.update(user, {"modification_time": timestamp})

    async def on_after_login(
        self,
        user: User,
        request: Optional[Request] = None,
        response: Optional[Response] = None,
    ):
        print(f"User {user.id} has logged in.")
        timestamp = datetime.utcnow()
        await self.user_db.update(user, {"last_login_time": timestamp})

    async def on_before_delete(self, user: User, request: Optional[Request] = None):
        timestamp = datetime.utcnow()
        await self.user_db.update(user, {"deletion_time": timestamp})

    async def on_after_forgot_password(
        self, user: User, token: str, request: Optional[Request] = None
    ):
        # TODO: send email with a link to reset password, token is the reset password token
        #   that can be used in the /auth/reset-password endpoint
        print(f"User {user.id} has forgot their password. Reset token: {token}")

    async def on_after_request_verify(
        self, user: User, token: str, request: Optional[Request] = None
    ):
        # TODO: implement verification email sending
        print(f"Verification requested for user {user.id}. Verification token: {token}")


async def get_user_manager(user_db: SQLAlchemyUserDatabase = Depends(get_user_db)):
    yield UserManager(user_db)


bearer_transport = BearerTransport(tokenUrl="auth/jwt/login")


def get_jwt_strategy() -> JWTStrategy:
    return JWTStrategy(secret=SECRET, lifetime_seconds=3600)


auth_backend = AuthenticationBackend(
    name="jwt",
    transport=bearer_transport,
    get_strategy=get_jwt_strategy,
)

fastapi_users = FastAPIUsers[User, uuid.UUID](get_user_manager, [auth_backend])

current_active_user = fastapi_users.current_user(active=True)
