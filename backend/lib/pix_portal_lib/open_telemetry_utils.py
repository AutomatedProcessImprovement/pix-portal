from fastapi import FastAPI
from opentelemetry import trace
from opentelemetry.exporter.otlp.proto.grpc.trace_exporter import OTLPSpanExporter
from opentelemetry.instrumentation.fastapi import FastAPIInstrumentor
from opentelemetry.instrumentation.httpx import HTTPXClientInstrumentor
from opentelemetry.instrumentation.requests import RequestsInstrumentor
from opentelemetry.sdk.resources import Resource, SERVICE_NAME
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor


def instrument_app(
    app: FastAPI,
    service_name: str,
    otel_collector_endpoint: str = "http://otel-collector:4317",
    httpx: bool = True,
    requests: bool = False,
):
    """
    Instrument a FastAPI app with OpenTelemetry.
    """
    FastAPIInstrumentor.instrument_app(app)
    if httpx:
        HTTPXClientInstrumentor().instrument()
    if requests:
        RequestsInstrumentor().instrument()
    resource = Resource(attributes={SERVICE_NAME: service_name})
    provider = TracerProvider(resource=resource)
    processor = BatchSpanProcessor(OTLPSpanExporter(endpoint=otel_collector_endpoint))
    provider.add_span_processor(processor)
    trace.set_tracer_provider(provider)
