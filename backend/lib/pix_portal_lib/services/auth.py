"""
Commonly used authentication service for user authentication and authorization.
"""

import os
from typing import AsyncGenerator, Optional

import httpx
from fastapi import Depends, Header, HTTPException, Request
from pydantic import BaseModel

jwt_verification_url = os.environ.get("JWT_VERIFICATION_URL")


class TokenVerificationResponse(BaseModel):
    status: bool
    user: dict


class AuthService:
    def __init__(self):
        self._client = httpx.AsyncClient()
        self._jwt_verification_url = jwt_verification_url

    async def verify_token(self, token: str, is_superuser: bool = False) -> tuple[bool, Optional[dict]]:
        params = {"is_superuser": is_superuser}
        response = await self._client.post(
            self._jwt_verification_url,
            headers={"Authorization": f"Bearer {token}"},
            params=params,
            follow_redirects=True,
        )

        if response.status_code != 200:
            return False, None

        response_data = TokenVerificationResponse(**response.json())
        return response_data.status, response_data.user


async def get_auth_service() -> AsyncGenerator[AuthService, None]:
    yield AuthService()


async def get_current_user(
    request: Request,
    auth_service: AuthService = Depends(get_auth_service),
    authorization: str = Header(...),
) -> dict:
    # check if user is already in app state
    if hasattr(request.app.state, "user") and request.app.state.user is not None:
        return request.app.state.user

    # otherwise, make a request to Auth Service to verify the token
    token = authorization.split(" ")[1]
    ok, user = await auth_service.verify_token(token)
    if not ok:
        raise HTTPException(status_code=401, detail="Invalid authentication token")
    return user


async def add_user_to_app_state_if_present(
    request: Request,
    auth_service: AuthService = Depends(get_auth_service),
    authorization: str = Header(...),
):
    token = authorization.split(" ")[1]
    ok, user = await auth_service.verify_token(token)
    if not ok:
        user = None
    request.app.state.user = user


async def get_current_superuser(
    auth_service: AuthService = Depends(get_auth_service),
    authorization: str = Header(...),
) -> dict:
    token = authorization.split(" ")[1]
    ok, user = await auth_service.verify_token(token, is_superuser=True)
    if not ok:
        raise HTTPException(status_code=401, detail="Invalid authentication token")
    return user
