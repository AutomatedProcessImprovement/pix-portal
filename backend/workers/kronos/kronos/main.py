import asyncio
import json
import logging
import uuid

import pix_portal_lib.open_telemetry_utils as open_telemetry_utils
from kafka import KafkaConsumer
from kronos.kronos_service import KronosService
from kronos.settings import settings
from pix_portal_lib.service_clients.processing_request import ProcessingRequest

logger = logging.getLogger()

open_telemetry_utils.instrument_worker(service_name="waiting_time_analysis_kronos", httpx=True)

consumer_id = f"{settings.kafka_consumer_group_id}-{uuid.uuid4()}"
# group_id should be the same for all parallel consumers that process the same topic
group_id = settings.kafka_consumer_group_id

consumer = KafkaConsumer(
    settings.kafka_topic_requests,
    client_id=consumer_id,
    group_id=group_id,
    bootstrap_servers=settings.kafka_bootstrap_servers,
    auto_offset_reset="earliest",
    value_deserializer=lambda x: json.loads(x.decode("utf-8")),
)

logger.info(
    f"Kafka consumer connected: "
    f"consumer_id={consumer_id}, "
    f"group_id={group_id}, "
    f"bootstrap_connected={consumer.bootstrap_connected()}"
)

kronos_service = KronosService()


async def process_message(message):
    logger.info(f"Kafka consumer {consumer_id} received a message from Kafka: {message}")
    request = ProcessingRequest(**message.value)
    try:
        await kronos_service.process(request)
        logger.info(f"Kafka consumer {consumer_id} finished processing the message: {message}")
    except Exception as e:
        logger.exception(f"Kafka consumer {consumer_id} failed to process the message: {message}, error: {e}")


async def main():
    for message in consumer:
        if asyncio.get_event_loop().is_closed():
            asyncio.set_event_loop(asyncio.new_event_loop())
        await asyncio.create_task(process_message(message))


asyncio.run(main())
