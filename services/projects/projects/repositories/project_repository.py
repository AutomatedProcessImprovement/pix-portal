import uuid
from datetime import datetime
from typing import AsyncGenerator, Optional
from uuid import UUID

from fastapi import Depends
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from .db import get_async_session
from .models import Project
from .project_repository_interface import ProjectRepositoryInterface


class ProjectNotFound(Exception):
    pass


class ProjectRepository(ProjectRepositoryInterface):
    """
    Database repository for projects.
    """

    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_projects(self) -> list[Project]:
        result = await self.session.execute(select(Project))
        return result.scalars().all()

    async def get_projects_by_user_id(self, user_id: UUID) -> list[Project]:
        result = await self.session.execute(select(Project).where(Project.users_ids.contains([user_id])))
        return result.scalars().all()

    async def create_project(
        self,
        name: str,
        users_ids: list[uuid.UUID],
        assets_ids: list[uuid.UUID] = [],
        processing_requests_ids: list[uuid.UUID] = [],
        description: Optional[str] = None,
    ) -> Project:
        project = Project(
            name=name,
            users_ids=users_ids,
            assets_ids=assets_ids,
            processing_requests_ids=processing_requests_ids,
            description=description,
        )
        self.session.add(project)
        await self.session.commit()
        return project

    async def get_project(self, project_id: uuid.UUID) -> Project:
        result = await self.session.execute(select(Project).where(Project.id == project_id))
        project = result.scalar()
        if project is None:
            raise ProjectNotFound()
        return project

    async def update_project(
        self,
        project_id: uuid.UUID,
        name: Optional[str] = None,
        description: Optional[str] = None,
    ) -> Project:
        project = await self.get_project(project_id)
        if name is not None:
            project.name = name
        if description is not None:
            project.description = description
        project.modification_time = datetime.utcnow()
        await self.session.commit()
        return project

    async def add_user_to_project(self, project_id: uuid.UUID, user_id: uuid.UUID) -> Project:
        project = await self.get_project(project_id)

        # NOTE: don't use "append" on arrays because it doesn't trigger SQLAlchemy to update the database
        #   https://docs.sqlalchemy.org/en/20/dialects/postgresql.html#sqlalchemy.dialects.postgresql.ARRAY
        users_ids = project.users_ids + [user_id]
        project.users_ids = list(set(users_ids))

        project.modification_time = datetime.utcnow()
        await self.session.commit()
        return project

    async def remove_user_from_project(self, project_id: uuid.UUID, user_id: uuid.UUID) -> Project:
        project = await self.get_project(project_id)

        # NOTE: don't use "append" on arrays because it doesn't trigger SQLAlchemy to update the database
        #   https://docs.sqlalchemy.org/en/20/dialects/postgresql.html#sqlalchemy.dialects.postgresql.ARRAY
        project.users_ids = self._remove_item_from_list(project.users_ids, user_id)

        project.modification_time = datetime.utcnow()
        await self.session.commit()
        return project

    async def add_asset_to_project(self, project_id: uuid.UUID, asset_id: uuid.UUID) -> Project:
        project = await self.get_project(project_id)

        # NOTE: don't use "append" on arrays because it doesn't trigger SQLAlchemy to update the database
        #   https://docs.sqlalchemy.org/en/20/dialects/postgresql.html#sqlalchemy.dialects.postgresql.ARRAY
        assets_ids = project.assets_ids + [asset_id]
        project.assets_ids = list(set(assets_ids))

        project.modification_time = datetime.utcnow()
        await self.session.commit()
        return project

    async def remove_asset_from_project(self, project_id: uuid.UUID, asset_id: uuid.UUID) -> Project:
        project = await self.get_project(project_id)

        # NOTE: don't use "append" on arrays because it doesn't trigger SQLAlchemy to update the database
        #   https://docs.sqlalchemy.org/en/20/dialects/postgresql.html#sqlalchemy.dialects.postgresql.ARRAY
        assets_ids = self._remove_item_from_list(project.assets_ids, asset_id)
        project.assets_ids = assets_ids

        project.modification_time = datetime.utcnow()
        await self.session.commit()
        return project

    async def add_processing_request_to_project(
        self, project_id: uuid.UUID, processing_request_id: uuid.UUID
    ) -> Project:
        project = await self.get_project(project_id)

        # NOTE: don't use "append" on arrays because it doesn't trigger SQLAlchemy to update the database
        #   https://docs.sqlalchemy.org/en/20/dialects/postgresql.html#sqlalchemy.dialects.postgresql.ARRAY
        processing_requests_ids = project.processing_requests_ids + [processing_request_id]
        project.processing_requests_ids = list(set(processing_requests_ids))

        project.modification_time = datetime.utcnow()
        await self.session.commit()
        return project

    async def delete_project(self, project_id: uuid.UUID) -> None:
        await self.session.execute(
            update(Project).where(Project.id == project_id).values(deletion_time=datetime.utcnow())
        )
        await self.session.commit()

    @staticmethod
    def _remove_item_from_list(items: list, item: any) -> list:
        result = []
        for i in items:
            if i != item:
                result.append(i)
        return result


async def get_project_repository(
    session: AsyncSession = Depends(get_async_session),
) -> AsyncGenerator[ProjectRepository, None]:
    yield ProjectRepository(session)
