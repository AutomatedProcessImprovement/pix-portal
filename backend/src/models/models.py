from sqlalchemy import Column, ForeignKey, Integer, String, DateTime, LargeBinary, Table
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import text
from sqlalchemy.ext.declarative import declarative_base
import uuid
from datetime import datetime

from src.database.database import Base

user_project_association = Table(
    'user_project_association',
    Base.metadata,
    Column('user_id', ForeignKey('user.id'), primary_key=True),
    Column('project_id', ForeignKey('project.id'), primary_key=True)
)

project_shared_user_association = Table(
    'project_shared_user_association',
    Base.metadata,
    Column('project_id', ForeignKey('project.id'), primary_key=True),
    Column('user_id', ForeignKey('user.id'), primary_key=True)
)


class Project(Base):
    __tablename__ = 'project'
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    created_at = Column(DateTime(timezone=True), nullable=False, server_default=text("now()"))
    updated_at = Column(DateTime(timezone=True), nullable=False, server_default=text("now()"), onupdate=text("now()"))
    files = relationship('File', back_populates='project', cascade="all, delete, delete-orphan", passive_deletes=True)
    owner_id = Column(UUID(as_uuid=True), ForeignKey('user.id'))
    users = relationship('User', secondary=user_project_association, back_populates='projects')
    shared_users = relationship('User', secondary=project_shared_user_association, back_populates='shared_projects',
                                cascade="save-update, merge, delete")


class User(Base):
    __tablename__ = 'user'
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    zitadel_id = Column(String, nullable=False, unique=True)
    created_at = Column(DateTime(timezone=True), nullable=False, server_default=text("now()"))
    updated_at = Column(DateTime(timezone=True), nullable=False, server_default=text("now()"))
    projects = relationship('Project', secondary=user_project_association, back_populates='users')
    shared_projects = relationship('Project', secondary=project_shared_user_association, back_populates='shared_users',
                                   cascade="save-update, merge")


class Tag(Base):
    __tablename__ = 'tag'
    id = Column(Integer, primary_key=True, autoincrement=True)
    value = Column(String(255), nullable=False)
    files = relationship('File', back_populates='tag')


class File(Base):
    __tablename__ = 'file'
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    extension = Column(String(255), nullable=False)
    path = Column(String)
    tag_id = Column(Integer, ForeignKey('tag.id'))
    tag = relationship('Tag', back_populates='files')
    project_id = Column(UUID(as_uuid=True), ForeignKey('project.id', ondelete="CASCADE"))
    project = relationship('Project', back_populates='files')
    created_at = Column(DateTime(timezone=True), nullable=False, server_default=text("now()"))
    updated_at = Column(DateTime(timezone=True), nullable=False, server_default=text("now()"), onupdate=text("now()"))
