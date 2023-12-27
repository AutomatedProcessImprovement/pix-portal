import json
import logging
from typing import AsyncGenerator, Optional

from kafka import KafkaProducer

from api_server.processing_requests.persistence.model import ProcessingRequestType
from api_server.settings import settings

logger = logging.getLogger()


class KafkaProducerService:
    """
    Service for sending messages to Kafka topics.
    """

    # Number of partitions is the maximum amount of consumers that can read from a topic in parallel.
    # If num_partitions=10, then from 1 up to 10 consumers can read from the topic in parallel.
    _num_partitions = 10

    def __init__(self):
        # We use lazy initialization of the producer, because the KafkaProducerService is created for each request,
        # where the ProcessingRequestServiceClient is used. During initialization of the ProcessingRequestServiceClient,
        # KafkaProducer establishes a connection to Kafka, which is not necessary if we don't send any messages.
        self._producer: Optional[KafkaProducer] = None

        # This dictionary doesn't require us additionally handle concurrency, because built-in types are safe:
        # https://docs.python.org/3/glossary.html#term-global-interpreter-lock
        self._topics = {
            ProcessingRequestType.SIMULATION_PROSIMOS: {
                "topic": settings.kafka_topic_simulation_prosimos,
                "current_partition": 0,  # TODO: this doesn't work, it's always 0
            },
            ProcessingRequestType.SIMULATION_MODEL_OPTIMIZATION_SIMOD: {
                "topic": settings.kafka_topic_process_model_optimization_simod,
                "current_partition": 0,
            },
            ProcessingRequestType.SIMULATION_MODEL_OPTIMIZATION_OPTIMOS: {
                "topic": settings.kafka_topic_process_model_optimization_optimos,
                "current_partition": 0,
            },
            ProcessingRequestType.WAITING_TIME_ANALYSIS_KRONOS: {
                "topic": settings.kafka_topic_waiting_time_analysis_kronos,
                "current_partition": 0,
            },
        }

    def _init_producer(self):
        if self._producer is None:
            self._producer = KafkaProducer(
                bootstrap_servers=settings.kafka_bootstrap_servers,
                value_serializer=lambda x: json.dumps(x).encode("utf-8"),
                client_id="processing-requests",
            )

    def send_message(self, processing_request_type: ProcessingRequestType, payload: dict):
        """
        Send a message to a Kafka topic depending on the processing request type.
        """
        topic, partition = self._get_topic_and_partition(processing_request_type)
        self._send_message(topic, payload, partition)

    def _send_message(self, topic: str, payload: dict, partition: int = 0):
        self._init_producer()
        self._producer.send(topic, payload, partition=partition)
        logger.info(f"Sending a message to Kafka: topic={topic}, partition={partition}, payload={payload}")
        self._producer.flush()

    def _get_topic_and_partition(self, processing_request_type: ProcessingRequestType) -> tuple[str, int]:
        topic = self._topics[processing_request_type]["topic"]
        current_partition = self._topics[processing_request_type]["current_partition"]
        partition = current_partition % self._num_partitions
        self._topics[processing_request_type]["current_partition"] += 1
        return topic, partition


async def get_kafka_service() -> AsyncGenerator[KafkaProducerService, None]:
    yield KafkaProducerService()
