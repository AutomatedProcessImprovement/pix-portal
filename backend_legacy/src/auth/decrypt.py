import http
import os

import dotenv
import jwt
from dotenv import load_dotenv
from fastapi import Depends, Header, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from src.database.database import get_db
from src.models.models import User
from src.models.models import User as U


class UnauthorizedMessage(BaseModel):
    detail: str = "Bearer token missing or unknown"


def decode_user(token: str):
    """
    :param token: jwt token
    :return:
    """
    decoded_data = jwt.decode(
        jwt=token, options={"verify_signature": False}, algorithms=["RS256"]
    )
    print(decoded_data)

    return decoded_data


def get_token(
    authorization: str = Header(default="Bearer "),
) -> str:
    _, token = authorization.split(" ")
    print(token)
    # Simulate a database query to find a known token
    user_data = decode_user(token)
    if user_data["azp"] != os.getenv("ZITADEL_CLIENT_ID"):
        raise HTTPException(
            status_code=http.HTTPStatus.FORBIDDEN,
            detail=UnauthorizedMessage().detail,
        )
    return user_data


async def check_if_user_exists(
    authorization: str = Header(default="Bearer "), db: Session = Depends(get_db)
):
    user_data = get_token(authorization)

    user = db.query(U).filter(U.zitadel_id == user_data["sub"]).first()
    if not user:
        new_user = User(zitadel_id=user_data["sub"])
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
    return user
