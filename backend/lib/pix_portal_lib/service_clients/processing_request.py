import logging
import os
from dataclasses import dataclass
from enum import Enum
from typing import Optional
from urllib.parse import urljoin

import httpx

from .self_authenticating_client import SelfAuthenticatingClient

processing_request_service_url = os.environ.get("PROCESSING_REQUEST_SERVICE_URL")

logger = logging.getLogger()


@dataclass
class ProcessingRequest:
    """
    A data processing request that is received from the Kafka topic.
    """

    processing_request_id: str
    user_id: str
    project_id: str
    input_assets_ids: list[str]
    output_assets_ids: list[str]
    jwt_token: str


class ProcessingRequestStatus(str, Enum):
    """
    Status of the data processing activity.
    """

    CREATED = "created"
    RUNNING = "running"
    FINISHED = "finished"
    FAILED = "failed"
    CANCELLED = "cancelled"


class ProcessingRequestServiceClient(SelfAuthenticatingClient):
    def __init__(self):
        super().__init__()
        self._client = httpx.AsyncClient()
        self._base_url = processing_request_service_url
        if self._base_url is None:
            raise ValueError("PROCESSING_REQUEST_SERVICE_URL environment variable is not set")

    async def add_output_asset_to_processing_request(
        self, processing_request_id: str, asset_id: str, token: Optional[str] = None
    ) -> dict:
        url = urljoin(self._base_url, f"{processing_request_id}/output-assets")
        response = await self._client.post(url, headers=await self.request_headers(token), json={"asset_id": asset_id})
        response.raise_for_status()
        return response.json()

    async def update_status(
        self,
        processing_request_id: str,
        status: ProcessingRequestStatus,
        message: Optional[str] = None,
        token: Optional[str] = None,
    ) -> dict:
        url = urljoin(self._base_url, f"{processing_request_id}")
        headers = await self.request_headers(token)
        logger.info(
            f"Updating processing request status to {status.value} for processing request {processing_request_id}, headers={headers}"
        )
        response = await self._client.patch(url, headers=headers, json={"status": status, "message": message})
        response.raise_for_status()
        return response.json()
