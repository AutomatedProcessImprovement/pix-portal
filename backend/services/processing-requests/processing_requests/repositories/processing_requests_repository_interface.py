from abc import ABC, abstractmethod
from collections.abc import Coroutine
from typing import Optional, Sequence
from uuid import UUID

from .models import ProcessingRequest, ProcessingRequestStatus, ProcessingRequestType


class ProcessingRequestRepositoryInterface(ABC):
    @abstractmethod
    def get_processing_requests(self) -> Coroutine[Sequence[ProcessingRequest]]:
        pass

    @abstractmethod
    def get_processing_requests_by_user_id(self, user_id: UUID) -> Coroutine[Sequence[ProcessingRequest]]:
        pass

    @abstractmethod
    def get_processing_requests_by_project_id(self, user_id: UUID) -> Coroutine[Sequence[ProcessingRequest]]:
        pass

    @abstractmethod
    def get_processing_requests_by_asset_id(self, user_id: UUID) -> Coroutine[Sequence[ProcessingRequest]]:
        pass

    @abstractmethod
    def get_processing_requests_by_input_asset_id(self, user_id: UUID) -> Coroutine[Sequence[ProcessingRequest]]:
        pass

    @abstractmethod
    def get_processing_requests_by_output_asset_id(self, user_id: UUID) -> Coroutine[Sequence[ProcessingRequest]]:
        pass

    @abstractmethod
    def create_processing_request(
        self,
        type: ProcessingRequestType,
        user_id: UUID,
        project_id: UUID,
        input_assets_ids: list[UUID],
        output_assets_ids: list[UUID],
    ) -> ProcessingRequest:
        pass

    @abstractmethod
    def get_processing_request(self, processing_request_id: UUID) -> ProcessingRequest:
        pass

    @abstractmethod
    def update_processing_request(
        self,
        processing_request_id: UUID,
        status: Optional[ProcessingRequestStatus] = None,
        message: Optional[str] = None,
    ) -> ProcessingRequest:
        pass

    @abstractmethod
    def add_input_asset_to_processing_request(self, processing_request_id: UUID, asset_id: UUID) -> ProcessingRequest:
        pass

    @abstractmethod
    def add_output_asset_to_processing_request(self, processing_request_id: UUID, asset_id: UUID) -> ProcessingRequest:
        pass
