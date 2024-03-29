import logging
import uuid
from datetime import datetime
from typing import Any, Dict, Optional

import urllib3
from fastapi import Depends, Request, Response
from fastapi_users import BaseUserManager, FastAPIUsers, UUIDIDMixin
from fastapi_users.authentication import (
    AuthenticationBackend,
    BearerTransport,
    JWTStrategy,
)
from fastapi_users.db import SQLAlchemyUserDatabase
from opentelemetry import metrics

from api_server.settings import settings
from api_server.utils.email import publish_email_event

from .db import User, get_users_db

SECRET = settings.secret_key_file.read_text().strip()

logger = logging.getLogger()

meter = metrics.get_meter(__name__)
new_users_counter = meter.create_counter(
    name="new_users",
    description="Number of new users",
    unit="1",
)
deleted_users_counter = meter.create_counter(
    name="deleted_users",
    description="Number of deleted users",
    unit="1",
)
user_verifications_counter = meter.create_counter(
    name="user_verifications",
    description="Number of user verifications",
    unit="1",
)
passwords_reset_counter = meter.create_counter(
    name="passwords_reset",
    description="Number of passwords reset",
    unit="1",
)
user_logins_counter = meter.create_counter(
    name="user_logins",
    description="Number of user logins",
    unit="1",
)


class UserManager(UUIDIDMixin, BaseUserManager[User, uuid.UUID]):
    reset_password_token_secret = SECRET
    verification_token_secret = SECRET

    async def on_after_register(self, user: User, request: Optional[Request] = None):
        logger.info(f"New user {user.id} has registered")
        new_users_counter.add(1, {"user_id": str(user.id)})
        timestamp = datetime.utcnow()
        await self.user_db.update(user, {"creation_time": timestamp})
        await self.request_verify(user, request)

    async def on_after_update(self, user: User, update_dict: Dict[str, Any], request: Optional[Request] = None):
        logger.info(f"User {user.id} has been updated")
        timestamp = datetime.utcnow()
        await self.user_db.update(user, {"modification_time": timestamp})

    async def on_after_login(
        self,
        user: User,
        request: Optional[Request] = None,
        response: Optional[Response] = None,
    ):
        logger.info(f"User {user.id} has logged in")
        user_logins_counter.add(1, {"user_id": str(user.id)})
        timestamp = datetime.utcnow()
        await self.user_db.update(user, {"last_login_time": timestamp})

    async def on_before_delete(self, user: User, request: Optional[Request] = None):
        logger.info(f"User {user.id} is about to be deleted")
        timestamp = datetime.utcnow()
        await self.user_db.update(user, {"deletion_time": timestamp})

    async def on_after_forgot_password(self, user: User, token: str, request: Optional[Request] = None):
        logger.info(f"User {user.id} has forgotten their password. Reset token: {token}")
        url = f"{settings.frontend_reset_password_public_url.unicode_string().strip('/')}/{token}"
        try:
            await publish_email_event(
                subject="[PIX Registration] Password reset",
                message=f"Please click on the link to reset your password: {url}",
                email=user.email,
            )
        except Exception as e:
            logger.error(f"Failed to send password reset email to user {user.id}: {e}")
            raise
        passwords_reset_counter.add(1, {"user_id": str(user.id)})

    async def on_after_request_verify(self, user: User, token: str, request: Optional[Request] = None):
        logger.info(f"Verification requested for user {user.id}. Verification token: {token}")
        url = f"{settings.frontend_verify_public_url.unicode_string().strip('/')}/{token}"
        try:
            await publish_email_event(
                subject="[PIX Registration] Email verification",
                message=f"Please click on the link to verify your email: {url}",
                email=user.email,
            )
        except Exception as e:
            logger.error(f"Failed to send verification email to user {user.id}: {e}")
            raise
        user_verifications_counter.add(1, {"user_id": str(user.id)})

    async def on_after_verify(self, user: User, request: Optional[Request] = None):
        logger.info(f"User {user.id} has been verified")


async def get_user_manager(user_db: SQLAlchemyUserDatabase = Depends(get_users_db)):
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

current_user = fastapi_users.current_user()
current_optional_user = fastapi_users.current_user(optional=True)
current_active_user = fastapi_users.current_user(active=True)
current_superuser = fastapi_users.current_user(active=True, superuser=True)
