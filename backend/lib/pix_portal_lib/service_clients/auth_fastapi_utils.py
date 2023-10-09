from typing import AsyncGenerator

from fastapi import Depends, Header, HTTPException, Request

from .auth import AuthServiceClient


async def get_auth_service_client() -> AsyncGenerator[AuthServiceClient, None]:
    yield AuthServiceClient()


async def get_current_user(
    request: Request,
    auth_service: AuthServiceClient = Depends(get_auth_service_client),
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
    auth_service: AuthServiceClient = Depends(get_auth_service_client),
    authorization: str = Header(...),
):
    token = authorization.split(" ")[1]
    ok, user = await auth_service.verify_token(token)
    if not ok:
        user = None
    request.app.state.user = user


async def get_current_superuser(
    auth_service: AuthServiceClient = Depends(get_auth_service_client),
    authorization: str = Header(...),
) -> dict:
    token = authorization.split(" ")[1]
    ok, user = await auth_service.verify_token(token, is_superuser=True)
    if not ok:
        raise HTTPException(status_code=401, detail="Invalid authentication token")
    return user
