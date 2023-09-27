import logging
import time

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.types import ASGIApp

logger = logging.getLogger()


class RequestLoggingMiddleware(BaseHTTPMiddleware):
    """
    FastAPI middleware that logs incoming requests.
    """

    def __init__(self, app: ASGIApp):
        super().__init__(app)

    async def dispatch(self, request: Request, call_next):
        start = time.time()
        response = await call_next(request)
        end = time.time()

        user = {}
        if hasattr(request.app.state, "user"):
            user = request.app.state.user or {}

        logger.info(
            f"action=request "
            f"method={request.method} "
            f"url={request.url} "
            f"path={request.url.path} "
            f"query={request.url.query} "
            f"user_agent={request.headers.get('user-agent')} "
            f"user_id={user.get('id')} "
            f"status_code={response.status_code} "
            f"duration={end-start}"
        )

        return response
