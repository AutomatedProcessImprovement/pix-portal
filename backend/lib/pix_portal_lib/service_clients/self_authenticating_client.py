import logging
from typing import Optional

from .auth import AuthServiceClient

logger = logging.getLogger()


class SelfAuthenticatingClient:
    """
    A client that can authenticate itself using the system JWT token if no token is provided.
    """

    def __init__(self):
        self._auth_service_client = AuthServiceClient()
        self._token = None

    @property
    async def token(self) -> str:
        if self._token is None:
            try:
                self._token = await self._auth_service_client.get_system_jwt_token()
            except Exception as e:
                logger.error(f"Error getting system JWT token: {e}")
                raise e
        return self._token

    async def request_headers(self, token: Optional[str] = None) -> dict[str, str]:
        t = token or await self.token
        return {"Authorization": f"Bearer {t}"}

    def nullify_token(self) -> None:
        self._token = None
