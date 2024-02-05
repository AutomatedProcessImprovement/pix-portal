import json
import logging
from dataclasses import dataclass
from typing import Optional

from kafka import KafkaProducer
from kafka.admin import KafkaAdminClient, NewTopic

from api_server.utils.utils import get_env

kafka_topic = get_env("KAFKA_TOPIC_EMAIL_NOTIFICATIONS")
kafka_bootstrap_servers = get_env("KAFKA_BOOTSTRAP_SERVERS")

logger = logging.getLogger()


@dataclass
class EmailNotificationRequest:
    """
    Email notification request from Kafka.
    """

    to_addrs: list[str]
    subject: str
    body: str
    processing_request_id: Optional[str] = None


class EmailNotificationProducer:
    """
    Class encapsulating the Kafka producer for sending email notification requests.
    """

    _client_id: str
    _replication_factor: int
    _topic = kafka_topic

    # Number of partitions is the maximum amount of consumers that can read from a topic in parallel.
    # If num_partitions=10, then from 1 up to 10 consumers can read from the topic in parallel.
    _num_partitions = 1

    _producer: Optional[KafkaProducer]

    def __init__(self, client_id: str, replication_factor: int = 1):
        self._client_id = client_id
        self._replication_factor = replication_factor

        # We use lazy initialization of the producer, because the KafkaProducerService is created for each request,
        # where the ProcessingRequestServiceClient is used. During initialization of the ProcessingRequestServiceClient,
        # KafkaProducer establishes a connection to Kafka, which is not necessary if we don't send any messages.
        self._producer: Optional[KafkaProducer] = None

    @property
    def producer(self) -> KafkaProducer:
        if self._producer is None:
            self._init_producer()
        return self._producer

    def _init_producer(self):
        if self._producer is None:
            self._producer = KafkaProducer(
                bootstrap_servers=kafka_bootstrap_servers,
                value_serializer=lambda x: json.dumps(x).encode("utf-8"),
                client_id=self._client_id,
            )

    def send_message(self, payload: EmailNotificationRequest):
        """
        Send a message to a Kafka topic.
        """
        partition = self._get_partition(payload.processing_request_id)
        self._send_message(self._topic, payload.__dict__, partition)

    def _send_message(self, topic: str, payload: dict, partition: int = 0):
        self.producer.send(topic, payload, partition=partition)
        self.producer.flush()

    def _get_partition(self, processing_request_id: str) -> int:
        return hash(processing_request_id) % self._num_partitions

    def _ensure_topic_exists_with_partitions(self):
        admin_client = KafkaAdminClient(bootstrap_servers=kafka_bootstrap_servers)

        topics = admin_client.list_topics()
        if self._topic in topics:
            logger.info(f"Topic {self._topic} already exists, skipping creation, topics={topics}")

            # check number of partitions
            partition_ids = self.producer.partitions_for(self._topic)
            partitions_num = len(partition_ids)
            if partitions_num == self._num_partitions:
                return

            # invalid number of partitions, delete the topic and create it again
            logger.warning(
                f"Topic {self._topic} has {partitions_num} partitions, but expected {self._num_partitions}, "
                f"partition_ids={partition_ids}"
            )
            try:
                admin_client.delete_topics([self._topic])
                logger.info(f"Deleted topic {self._topic}")
            except Exception as e:
                logger.exception(f"Failed to delete topic {self._topic}, error: {e}")
                raise

        logger.info(
            f"Creating topic {self._topic} with {self._num_partitions} partitions "
            f"and replication factor {self._replication_factor}"
        )
        topics = [
            NewTopic(
                name=self._topic,
                num_partitions=self._num_partitions,
                replication_factor=self._replication_factor,
            )
        ]
        admin_client.create_topics(new_topics=topics, validate_only=False)
