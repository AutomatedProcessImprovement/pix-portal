from datetime import datetime
from typing import AsyncGenerator, Optional, Sequence
from uuid import UUID

from fastapi import Depends
from pix_portal_lib.persistence.sqlalchemy import get_async_session
from sqlalchemy import select, or_
from sqlalchemy.ext.asyncio import AsyncSession

from .model import ProcessingRequest, ProcessingRequestStatus


class ProcessingRequestNotFound(Exception):
    pass


class ProcessingRequestRepository:
    """
    Database repository for processing requests.
    """

    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_processing_requests(self) -> Sequence[ProcessingRequest]:
        result = await self.session.execute(select(ProcessingRequest))
        return result.scalars().all()

    async def get_processing_requests_by_user_id(self, user_id: UUID) -> Sequence[ProcessingRequest]:
        result = await self.session.execute(
            select(ProcessingRequest).where(
                ProcessingRequest.user_id == user_id,
            )
        )
        return result.scalars().all()

    async def get_processing_requests_by_project_id(self, project_id: UUID) -> Sequence[ProcessingRequest]:
        result = await self.session.execute(
            select(ProcessingRequest).where(
                ProcessingRequest.project_id == project_id,
            )
        )
        return result.scalars().all()

    async def get_processing_requests_by_asset_id(self, asset_id: UUID) -> Sequence[ProcessingRequest]:
        result = await self.session.execute(
            select(ProcessingRequest).where(
                or_(
                    ProcessingRequest.input_assets_ids.contains([asset_id]),
                    ProcessingRequest.output_assets_ids.contains([asset_id]),
                )
            )
        )
        return result.scalars().all()

    async def get_processing_requests_by_input_asset_id(self, asset_id: UUID) -> Sequence[ProcessingRequest]:
        result = await self.session.execute(
            select(ProcessingRequest).where(
                ProcessingRequest.input_assets_ids.contains([asset_id]),
            )
        )
        return result.scalars().all()

    async def get_processing_requests_by_output_asset_id(self, asset_id: UUID) -> Sequence[ProcessingRequest]:
        result = await self.session.execute(
            select(ProcessingRequest).where(
                ProcessingRequest.output_assets_ids.contains([asset_id]),
            )
        )
        return result.scalars().all()

    async def create_processing_request(
        self,
        type: str,
        user_id: UUID,
        project_id: UUID,
        input_assets_ids: list[UUID],
        should_notify: bool,
    ) -> ProcessingRequest:
        processing_request = ProcessingRequest(
            type=type,
            status=ProcessingRequestStatus.CREATED,
            user_id=user_id,
            project_id=project_id,
            input_assets_ids=input_assets_ids,
            output_assets_ids=[],
            should_notify=should_notify,
        )
        self.session.add(processing_request)
        await self.session.commit()
        return processing_request

    async def get_processing_request(self, processing_request_id: UUID) -> ProcessingRequest:
        result = await self.session.execute(
            select(ProcessingRequest).where(ProcessingRequest.id == processing_request_id)
        )
        processing_request = result.scalar()
        if processing_request is None:
            raise ProcessingRequestNotFound()
        return processing_request

    async def update_processing_request(
        self,
        processing_request_id: UUID,
        status: Optional[ProcessingRequestStatus] = None,
        message: Optional[str] = None,
        should_notify: Optional[bool] = None,
    ) -> ProcessingRequest:
        processing_request = await self.get_processing_request(processing_request_id)
        if status is not None:
            processing_request.status = status
        if message is not None:
            processing_request.message = message
        if should_notify is not None:
            processing_request.should_notify = should_notify
        processing_request.modification_time = datetime.utcnow()
        await self.session.commit()
        return processing_request

    async def add_input_asset_to_processing_request(
        self, processing_request_id: UUID, asset_id: UUID
    ) -> ProcessingRequest:
        processing_request = await self.get_processing_request(processing_request_id)

        # NOTE: don't use "append" on arrays because it doesn't trigger SQLAlchemy to update the database
        #   https://docs.sqlalchemy.org/en/20/dialects/postgresql.html#sqlalchemy.dialects.postgresql.ARRAY
        input_assets_ids = processing_request.input_assets_ids + [asset_id]
        processing_request.input_assets_ids = list(set(input_assets_ids))

        processing_request.modification_time = datetime.utcnow()
        await self.session.commit()
        return processing_request

    async def add_output_asset_to_processing_request(
        self, processing_request_id: UUID, asset_id: UUID
    ) -> ProcessingRequest:
        processing_request = await self.get_processing_request(processing_request_id)

        # NOTE: don't use "append" on arrays because it doesn't trigger SQLAlchemy to update the database
        #   https://docs.sqlalchemy.org/en/20/dialects/postgresql.html#sqlalchemy.dialects.postgresql.ARRAY
        output_assets_ids = processing_request.output_assets_ids + [asset_id]
        processing_request.output_assets_ids = list(set(output_assets_ids))

        processing_request.modification_time = datetime.utcnow()
        await self.session.commit()
        return processing_request


async def get_processing_request_repository(
    session: AsyncSession = Depends(get_async_session),
) -> AsyncGenerator[ProcessingRequestRepository, None]:
    yield ProcessingRequestRepository(session)
