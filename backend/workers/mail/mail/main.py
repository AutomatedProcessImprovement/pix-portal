import asyncio
import json
import logging
import uuid

from kafka import KafkaConsumer

import open_telemetry_utils
from mail.services.mail import EmailNotificationRequest, send_email
from mail.settings import settings

logger = logging.getLogger()

open_telemetry_utils.instrument_worker(service_name="mail", httpx=True)

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


async def process_message(message):
    logger.info(f"Kafka consumer {consumer_id} received a message from Kafka: {message}")
    request = EmailNotificationRequest(**message.value)
    try:
        await send_email(request)
        logger.info(f"Kafka consumer {consumer_id} sent an email to {request.to_addrs}")
    except Exception as e:
        logger.exception(
            f"Kafka consumer {consumer_id} failed to send an email with "
            f"subject={request.subject}, "
            f"to_addrs={request.to_addrs}: "
            f"{e}"
        )


async def main():
    for message in consumer:
        await asyncio.create_task(process_message(message))


asyncio.run(main())
