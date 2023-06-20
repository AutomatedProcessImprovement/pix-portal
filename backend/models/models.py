from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, Float, Identity, LargeBinary

from datetime import datetime

from sqlalchemy.orm import relationship

from config import Base


class Project(Base):
    __tablename__ = 'project'
    id = Column(Integer, Identity(), primary_key=True)
    name = Column(String(255), nullable=False)
    createdOn = Column(DateTime(), default=datetime.now)
    lastUpdate = Column(DateTime(), default=datetime.now, onupdate=datetime.now)
    files = relationship('File', back_populates='project')


class FileTag(Base):
    __tablename__ = 'fileTag'
    fileId = Column(Integer, ForeignKey('file.id'), primary_key=True)
    tagId = Column(Integer, ForeignKey('tag.id'), primary_key=True)


class Tag(Base):
    __tablename__ = 'tag'
    id = Column(Integer, Identity(), primary_key=True)
    value = Column(String(255), nullable=False)
    files = relationship('File', secondary=FileTag.__table__, back_populates='tags')


class File(Base):
    __tablename__ = 'file'
    id = Column(Integer, Identity(), primary_key=True)
    name = Column(String(255), nullable=False)
    createdOn = Column(DateTime(), default=datetime.now)
    content = Column(LargeBinary, nullable=False)
    tags = relationship('Tag', secondary=FileTag.__table__, back_populates='files')
    project = relationship('Project', back_populates='files')
    project_id = Column(Integer, ForeignKey('project.id'))
    # TODO FILE OWNERSHIP

    # TODO PROJECT OWNERSHIP
