import asyncio
import json
import logging
import uuid

from kafka import KafkaConsumer
from pix_portal_lib.service_clients.processing_request import ProcessingRequest

import open_telemetry_utils
import settings
from .simod import SimodService

logger = logging.getLogger()

open_telemetry_utils.instrument_worker(service_name="bps-discovery-simod", httpx=True)

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

simod_service = SimodService()

for message in consumer:
    logger.info(f"Kafka consumer {consumer_id} received a message from Kafka: {message}")
    processing_request_payload = ProcessingRequest(**message.value)
    asyncio.run(simod_service.process(processing_request_payload))
    logger.info(f"Kafka consumer {consumer_id} finished processing the message: {message}")
