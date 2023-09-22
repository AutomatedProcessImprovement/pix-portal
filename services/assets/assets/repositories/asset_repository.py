import uuid
from datetime import datetime
from typing import AsyncGenerator, Optional

from fastapi import Depends
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from .asset_repository_interface import AssetRepositoryInterface
from .db import get_async_session
from .models import Asset, AssetType


class AssetNotFound(Exception):
    pass


class AssetRepository(AssetRepositoryInterface):
    """
    Database repository for assets.
    """

    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_assets(self) -> list[Asset]:
        result = await self.session.execute(select(Asset))
        return result.scalars().all()

    async def get_assets_by_project_id(self, project_id: uuid.UUID) -> list[Asset]:
        result = await self.session.execute(select(Asset).where(Asset.project_id == project_id))
        return result.scalars().all()

    async def get_assets_by_processing_request_id(self, processing_request_id: uuid.UUID) -> list[Asset]:
        result = await self.session.execute(
            select(Asset).where(Asset.processing_requests_ids.contains(processing_request_id))
        )
        return result.scalars().all()

    async def create_asset(
        self,
        name: str,
        type: AssetType,
        file_id: uuid.UUID,
        project_id: uuid.UUID,
        processing_requests_ids: list[uuid.UUID] = [],
        description: Optional[str] = None,
    ) -> Asset:
        asset = Asset(
            name=name,
            type=type,
            file_id=file_id,
            project_id=project_id,
            processing_requests_ids=processing_requests_ids,
            description=description,
        )
        self.session.add(asset)
        await self.session.commit()
        return asset

    async def get_asset(self, asset_id: uuid.UUID) -> Asset:
        result = await self.session.execute(select(Asset).where(Asset.id == asset_id))
        asset = result.scalar()
        if asset is None:
            raise AssetNotFound()
        return asset

    async def update_asset(
        self,
        asset_id: uuid.UUID,
        name: Optional[str] = None,
        description: Optional[str] = None,
        type: Optional[AssetType] = None,
        file_id: Optional[uuid.UUID] = None,
        project_id: Optional[uuid.UUID] = None,
        processing_requests_ids: Optional[list[uuid.UUID]] = None,
    ) -> Asset:
        asset = await self.get_asset(asset_id)
        if name is not None:
            asset.name = name
        if description is not None:
            asset.description = description
        if type is not None:
            asset.type = type
        if file_id is not None:
            asset.file_id = file_id
        if project_id is not None:
            asset.project_id = project_id
        if processing_requests_ids is not None:
            asset.processing_requests_ids = processing_requests_ids
        asset.modification_time = datetime.utcnow()
        await self.session.commit()
        return asset

    async def delete_asset(self, asset_id: uuid.UUID) -> None:
        await self.session.execute(update(Asset).where(Asset.id == asset_id).values(deletion_time=datetime.utcnow()))
        await self.session.commit()


async def get_asset_repository(
    session: AsyncSession = Depends(get_async_session),
) -> AsyncGenerator[AssetRepository, None]:
    yield AssetRepository(session)
