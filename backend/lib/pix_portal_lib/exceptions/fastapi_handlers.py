import logging
import traceback

from fastapi import Request, HTTPException
from fastapi.responses import JSONResponse

logger = logging.getLogger()


def general_exception_handler(request: Request, exc: Exception):
    traceback_str = "".join(traceback.format_exception(etype=type(exc), value=exc, tb=exc.__traceback__))

    user_id = _get_user_id_if_present(request)

    logger.error(
        f"scope=request "
        f"user_id={user_id} "
        f"method={request.method} "
        f"url={request.url} "
        f"path={request.url.path} "
        f"query={request.url.query} "
        f"user_agent={request.headers.get('user-agent')} "
        f"request_bytes={request.headers.get('content-length')} "
        f"traceback={traceback_str}"
    )

    return JSONResponse(
        status_code=500,
        content={
            "message": "Internal server error",
            "detail": f"{exc}",
            "traceback": traceback_str,
        },
    )


def http_exception_handler(request: Request, exc: HTTPException):
    user_id = _get_user_id_if_present(request)

    extra = {
        "status_code": exc.status_code,
        "detail": exc.detail,
        "user_id": user_id,
        "method": request.method,
        "url": str(request.url),
        "path": request.url.path,
        "query": request.url.query,
        "user_agent": request.headers.get("user-agent"),
        "request_bytes": request.headers.get("content-length"),
    }

    logger.error(f"{exc.detail}, extra={extra}")

    return JSONResponse(
        status_code=exc.status_code,
        content={
            "message": exc.detail,
        },
    )


def _get_user_id_if_present(request: Request):
    user_id = "anonymous"
    if hasattr(request.app.state, "user"):
        user = request.app.state.user or {}
        user_id = user.get("id", "anonymous")
    return user_id
