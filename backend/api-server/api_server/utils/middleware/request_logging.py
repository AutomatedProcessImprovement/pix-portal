import logging
import time
from typing import Optional

from opentelemetry import metrics
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.types import ASGIApp

from api_server.users.db import User

logger = logging.getLogger()

meter = metrics.get_meter(__name__)
requests_counter = meter.create_counter(
    name="requests",
    description="Number of requests",
    unit="1",
)
requests_duration_histogram = meter.create_histogram(
    name="requests_duration",
    description="The distribution of the duration of requests",
    unit="s",
)


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

        user = await _get_user_from_request(request)
        user_id = str(user.id) if user else "anonymous"

        logger.info(
            f"scope=request "
            f"method={request.method} "
            f"url={request.url} "
            f"path={request.url.path} "
            f"query={request.url.query} "
            f"user_agent={request.headers.get('user-agent')} "
            f"user_id={user_id} "
            f"status_code={response.status_code} "
            f"request_bytes={request.headers.get('content-length')} "
            f"response_bytes={response.headers.get('content-length')} "
            f"duration={end-start}"
        )

        requests_counter.add(
            1,
            {
                "url": str(request.url),
                "method": request.method,
                "status_code": response.status_code,
                "user_id": user_id,
                "user_agent": request.headers.get("user-agent"),
            },
        )

        requests_duration_histogram.record(
            end - start,
            {
                "url": str(request.url),
                "method": request.method,
                "status_code": response.status_code,
                "user_id": user_id,
                "user_agent": request.headers.get("user-agent"),
            },
        )

        return response


async def _get_user_from_request(request: Request) -> Optional[User]:
    return getattr(request.state, "current_user", None)
