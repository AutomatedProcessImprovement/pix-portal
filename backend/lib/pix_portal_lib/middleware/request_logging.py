import logging
import time

from opentelemetry import metrics
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.types import ASGIApp

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
        duration = end - start

        user_id = "anonymous"
        if hasattr(request.app.state, "user"):
            user = request.app.state.user or {}
            user_id = user.get("id", "anonymous")

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
            f"duration={duration}"
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
            duration,
            {
                "url": str(request.url),
                "method": request.method,
                "status_code": response.status_code,
                "user_id": user_id,
                "user_agent": request.headers.get("user-agent"),
            },
        )

        return response
