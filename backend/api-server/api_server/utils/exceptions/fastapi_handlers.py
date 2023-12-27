import logging
import traceback

from fastapi import HTTPException, Request
from fastapi.responses import JSONResponse

from api_server.utils.utils import get_user_id

logger = logging.getLogger()


def general_exception_handler(request: Request, exc: Exception):
    traceback_str = _log_request(request, exc)
    return JSONResponse(
        status_code=500,
        content={
            "message": "Internal server error",
            "detail": f"{exc}",
            "traceback": traceback_str,
        },
    )


def http_exception_handler(request: Request, exc: HTTPException):
    traceback_str = _log_request(request, exc)
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "message": exc.detail,
            "traceback": traceback_str,
        },
    )


def _log_request(request: Request, exc: Exception) -> str:
    traceback_str = _traceback_str(exc)
    user_id = get_user_id(request)

    logger.error(
        f"scope=request "
        f"user_id={user_id} "
        f"method={request.method} "
        f"url={request.url} "
        f"path={request.url.path} "
        f"query={request.url.query} "
        f"user_agent={request.headers.get('user-agent')} "
        f"request_bytes={request.headers.get('content-length')} "
        f"headers={request.headers} "
        f"traceback={traceback_str}"
    )

    return traceback_str


def _traceback_str(exc: Exception) -> str:
    return "".join(traceback.format_exception(etype=type(exc), value=exc, tb=exc.__traceback__))
