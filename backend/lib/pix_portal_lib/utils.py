import os

from starlette.requests import Request


def get_env(env_var_name: str) -> str:
    value = os.getenv(env_var_name)
    if value is None:
        raise Exception(f"Environment variable {env_var_name} is not set")
    return value


def get_user_id(request: Request) -> str:
    user_id = _get_user_id_from_app_state(request) or _get_user_id_from_headers(request)
    return user_id


def _get_user_id_from_app_state(request: Request):
    user_id = "anonymous"
    if hasattr(request.app.state, "user"):
        user = request.app.state.user or {}
        user_id = user.get("id", "anonymous")
    return user_id


async def _get_user_id_from_headers(request: Request):
    from pix_portal_lib.service_clients.auth import AuthServiceClient

    user_id = "anonymous"
    authorization = request.headers.get("authorization")
    if authorization:
        token = authorization.split(" ")[1]
        auth_service = AuthServiceClient()
        ok, user = await auth_service.verify_token(token)
        if ok:
            user_id = user.get("id", "anonymous")
    return user_id
