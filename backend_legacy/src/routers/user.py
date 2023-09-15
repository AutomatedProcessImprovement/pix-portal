import http
import json

from fastapi import APIRouter, Depends, Form, HTTPException, status
from sqlalchemy.orm import Session
from src.database.database import get_db
from src.helpers.register_zitadel_user import send_registration_request
from src.models import models
from src.models.models import User

router = APIRouter()


@router.get("/")
def get_users(db: Session = Depends(get_db)):
    users = db.query(models.User).all()

    return {"status": http.HTTPStatus.OK, "results": len(users), "users": users}


@router.post("/", status_code=status.HTTP_201_CREATED)
def register_new_user(
    username: str = Form(...),
    firstname: str = Form(...),
    lastname: str = Form(...),
    email: str = Form(...),
    db: Session = Depends(get_db),
):
    zitadel_response = send_registration_request(username, firstname, lastname, email)

    res = zitadel_response[0]
    otp = zitadel_response[1]

    if res.status_code == 409:
        # ERR: USER ALREADY EXISTS
        raise HTTPException(
            status_code=409, detail="User already exists. Choose a different username."
        )
    if res.status_code == 400:
        # ERR: USER ALREADY EXISTS
        raise HTTPException(status_code=400, detail=res.reason)

    print(json.loads(res.text)["userId"])
    zitadel_id = json.loads(res.text)["userId"]
    new_user = User(zitadel_id=zitadel_id)

    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    print("PRE RETURN?")

    return {"status": http.HTTPStatus.OK, "otp": otp}
