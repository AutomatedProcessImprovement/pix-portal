from typing import AsyncGenerator

from .asset import AssetServiceClient


async def get_asset_service_client() -> AsyncGenerator[AssetServiceClient, None]:
    yield AssetServiceClient()
