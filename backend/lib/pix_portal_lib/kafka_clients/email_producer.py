import json
from dataclasses import dataclass
from typing import Optional

from kafka import KafkaProducer
from pix_portal_lib.utils import get_env

kafka_topic = get_env("KAFKA_TOPIC_EMAIL_NOTIFICATIONS")
kafka_bootstrap_servers = get_env("KAFKA_BOOTSTRAP_SERVERS")


@dataclass
class EmailNotificationRequest:
    """
    Email notification request from Kafka.
    """

    processing_request_id: str
    to_addrs: list[str]
    subject: str
    body: str


class EmailNotificationProducer:
    """
    Class encapsulating the Kafka producer for sending email notification requests.
    """

    _topic = kafka_topic

    # Number of partitions is the maximum amount of consumers that can read from a topic in parallel.
    # If num_partitions=10, then from 1 up to 10 consumers can read from the topic in parallel.
    _num_partitions = 10

    def __init__(self):
        # We use lazy initialization of the producer, because the KafkaProducerService is created for each request,
        # where the ProcessingRequestServiceClient is used. During initialization of the ProcessingRequestServiceClient,
        # KafkaProducer establishes a connection to Kafka, which is not necessary if we don't send any messages.
        self._producer: Optional[KafkaProducer] = None

    def _init_producer(self):
        if self._producer is None:
            self._producer = KafkaProducer(
                bootstrap_servers=kafka_bootstrap_servers,
                value_serializer=lambda x: json.dumps(x).encode("utf-8"),
                client_id="bps-discovery-simod",
            )

    def send_message(self, payload: EmailNotificationRequest):
        """
        Send a message to a Kafka topic.
        """
        partition = self._get_partition(payload.processing_request_id)
        self._send_message(self._topic, payload.__dict__, partition)

    def _send_message(self, topic: str, payload: dict, partition: int = 0):
        self._init_producer()
        self._producer.send(topic, payload, partition=partition)
        self._producer.flush()

    def _get_partition(self, processing_request_id: str) -> int:
        return hash(processing_request_id) % self._num_partitions
