import http
import json

from sqlalchemy.orm import Session
from fastapi import Depends, status, APIRouter, Form

from src.database.database import get_db
from src.helpers.generators import generateAlphaNumericUUID
from src.helpers.register_zitadel_user import send_registration_request
from src.models import models
from src.models.models import User
from src.schemas import schemas

router = APIRouter()


@router.get('/')
def get_users(db: Session = Depends(get_db)):
    users = db.query(models.User).all()

    return {'status': http.HTTPStatus.OK, 'results': len(users), 'users': users}


@router.post('/', status_code=status.HTTP_201_CREATED)
def register_new_user(
        username: str = Form(...),
        firstname: str = Form(...),
        lastname: str = Form(...),
        email: str = Form(...),
        db: Session = Depends(get_db)):

    zitadel_response = send_registration_request(username, firstname, lastname, email)

    res = zitadel_response[0]
    otp = zitadel_response[1]
    zitadel_id = json.loads(res.text)['userId']
    new_user = User(zitadel_id=zitadel_id)

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {'status': http.HTTPStatus.OK, 'otp': otp}
