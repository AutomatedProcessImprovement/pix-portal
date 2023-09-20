from abc import ABC, abstractmethod
from datetime import datetime
from typing import Optional
from uuid import UUID

from .models import Asset, AssetType


class AssetRepositoryInterface(ABC):
    @abstractmethod
    def get_assets(self) -> list[Asset]:
        pass

    @abstractmethod
    def get_assets_by_project_id(self, project_id: UUID) -> list[Asset]:
        pass

    @abstractmethod
    def get_assets_by_processing_request_id(
        self, processing_request_id: UUID
    ) -> list[Asset]:
        pass

    @abstractmethod
    def create_asset(
        self,
        name: str,
        type: AssetType,
        file_id: UUID,
        project_id: UUID,
        processing_requests_ids: list[UUID] = [],
        description: Optional[str] = None,
    ) -> Asset:
        pass

    @abstractmethod
    def get_asset(self, asset_id: UUID) -> Asset:
        pass

    @abstractmethod
    def update_asset(
        self,
        asset_id: UUID,
        name: Optional[str] = None,
        description: Optional[str] = None,
        type: Optional[AssetType] = None,
        file_id: Optional[UUID] = None,
        project_id: Optional[UUID] = None,
        processing_requests_ids: Optional[list[UUID]] = None,
        modification_time: Optional[datetime] = None,
    ) -> Asset:
        pass

    @abstractmethod
    def delete_asset(self, asset_id: int) -> None:
        pass
