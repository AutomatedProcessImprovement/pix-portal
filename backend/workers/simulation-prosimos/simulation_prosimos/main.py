import asyncio
import json
import logging
import uuid

import pix_portal_lib.open_telemetry_utils as open_telemetry_utils
from kafka import KafkaConsumer
from pix_portal_lib.service_clients.processing_request import ProcessingRequest

import settings
from .prosimos import ProsimosService

logger = logging.getLogger()

open_telemetry_utils.instrument_worker(service_name="simulation-prosimos", httpx=True)

consumer_id = f"{settings.settings.kafka_consumer_group_id}-{uuid.uuid4()}"
# group_id should be the same for all parallel consumers that process the same topic
group_id = settings.settings.kafka_consumer_group_id

consumer = KafkaConsumer(
    settings.settings.kafka_topic_requests,
    client_id=consumer_id,
    group_id=group_id,
    bootstrap_servers=settings.settings.kafka_bootstrap_servers,
    auto_offset_reset="earliest",
    value_deserializer=lambda x: json.loads(x.decode("utf-8")),
)

logger.info(
    f"Kafka consumer connected: "
    f"consumer_id={consumer_id}, "
    f"group_id={group_id}, "
    f"bootstrap_connected={consumer.bootstrap_connected()}"
)

prosimos_service = ProsimosService()

for message in consumer:
    logger.info(f"Kafka consumer {consumer_id} received a message from Kafka: {message}")
    processing_request_payload = ProcessingRequest(**message.value)
    asyncio.run(prosimos_service.process(processing_request_payload))
    logger.info(f"Kafka consumer {consumer_id} finished processing the message: {message}")
