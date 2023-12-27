import uuid
from datetime import datetime
from typing import Optional

from fastapi_users import schemas


class UserRead(schemas.BaseUser[uuid.UUID]):
    first_name: str
    last_name: str
    creation_time: datetime
    modification_time: Optional[datetime] = None
    deletion_time: Optional[datetime] = None
    last_login_time: Optional[datetime] = None


class UserCreate(schemas.BaseUserCreate):
    first_name: str
    last_name: str


class UserUpdate(schemas.BaseUserUpdate):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    modification_time: Optional[datetime] = None
    deletion_time: Optional[datetime] = None
    last_login_time: Optional[datetime] = None
