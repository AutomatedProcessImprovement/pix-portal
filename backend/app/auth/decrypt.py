import http

import jwt
from pydantic import BaseModel
from fastapi import Depends, HTTPException, Header
from sqlalchemy.orm import Session
from app.database.database import get_db
from app.models.models import User as U, User


class UnauthorizedMessage(BaseModel):
    detail: str = "Bearer token missing or unknown"


def decode_user(token: str):
    """
    :param token: jwt token
    :return:
    """
    decoded_data = jwt.decode(jwt=token,
                              options={"verify_signature": False},
                              algorithms=["RS256"])

    return decoded_data


def get_token(
        authorization: str = Header(default="Bearer "),
) -> str:
    _, token = authorization.split(" ")
    print(token)
    # Simulate a database query to find a known token
    user_data = decode_user(token)
    if user_data['azp'] != '221885342960123907@pix':
        raise HTTPException(
            status_code=http.HTTPStatus.FORBIDDEN,
            detail=UnauthorizedMessage().detail,
        )
    return user_data


async def check_if_user_exists(authorization: str = Header(default="Bearer "), db: Session = Depends(get_db)):
    user_data = get_token(authorization)

    user = db.query(U).filter(U.zitadel_id == user_data['sub']).first()
    if not user:
        new_user = User(zitadel_id=user_data['sub'])
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
    return user
