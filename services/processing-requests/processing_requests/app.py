import threading
import traceback

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

from .controllers import processing_requests
from .repositories.init_db import migrate_to_latest

app = FastAPI(
    title="PIX Portal Processing Requests",
    description="Processing request service for PIX Portal.",
    # TODO: update version programmatically
    version="0.1.0",
)


app.include_router(
    processing_requests.router,
    prefix="/processing-requests",
)


@app.exception_handler(Exception)
async def exception_handler(request: Request, exc: Exception):
    traceback_str = "".join(traceback.format_exception(etype=type(exc), value=exc, tb=exc.__traceback__))
    return JSONResponse(
        status_code=500,
        content={
            "message": "Internal server error",
            "detail": f"{exc}",
            "traceback": traceback_str,
        },
    )


@app.on_event("startup")
async def on_startup():
    try:
        # We need the lock to avoid the warning because of concurrent run.
        # See more at https://stackoverflow.com/questions/54351783/duplicate-key-value-violates-unique-constraint-postgres-error-when-trying-to-c
        lock = threading.Lock()
        with lock:
            await migrate_to_latest()
    except Exception as e:
        print(e)


def instrument_app(app: FastAPI, service_name: str):
    from opentelemetry import trace
    from opentelemetry.exporter.otlp.proto.grpc.trace_exporter import OTLPSpanExporter
    from opentelemetry.instrumentation.fastapi import FastAPIInstrumentor
    from opentelemetry.instrumentation.httpx import HTTPXClientInstrumentor
    from opentelemetry.sdk.resources import Resource, SERVICE_NAME
    from opentelemetry.sdk.trace import TracerProvider
    from opentelemetry.sdk.trace.export import BatchSpanProcessor

    FastAPIInstrumentor.instrument_app(app)
    HTTPXClientInstrumentor().instrument()
    resource = Resource(attributes={SERVICE_NAME: service_name})
    provider = TracerProvider(resource=resource)
    processor = BatchSpanProcessor(OTLPSpanExporter(endpoint="http://otel-collector:4317"))
    provider.add_span_processor(processor)
    trace.set_tracer_provider(provider)


instrument_app(app, service_name="processing-requests")
