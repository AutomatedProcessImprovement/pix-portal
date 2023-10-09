from typing import AsyncGenerator

from .asset import AssetService


async def get_asset_service() -> AsyncGenerator[AssetService, None]:
    yield AssetService()
