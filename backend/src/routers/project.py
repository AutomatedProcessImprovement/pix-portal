import http
from fastapi import APIRouter, Depends, UploadFile, status, File, Form, HTTPException, Header
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from typing import Annotated

from src.auth.decrypt import decode_user, get_token, check_if_user_exists
from src.database.database import get_db
from src.disk_storage.filestore import deleteFile
from src.models.models import Project as P, User as U, File as F, Tag as T

router = APIRouter()
auth_scheme = OAuth2PasswordBearer(tokenUrl="token")


@router.get('/')
async def get_all_projects(authorization: Annotated[str | None, Header()], db: Session = Depends(get_db)):
    user = await check_if_user_exists(authorization, db)
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")
    projects = db.query(P).filter(P.owner_id == user.id).all()
    return {'status': http.HTTPStatus.OK, 'projects': projects}


@router.post('/')
async def create_new_project(authorization: Annotated[str | None, Header()],
                             name: str = Form(...),
                             db: Session = Depends(get_db)):
    user = await check_if_user_exists(authorization, db)
    if not user:
        raise HTTPException(status_code=404, detail="User not found, are you logged in?")
    _project = P(name=name)
    _project.owner_id = user.id
    db.add(_project)
    db.commit()

    return {'status': http.HTTPStatus.CREATED, 'message': f"Project {name} successfully created"}


@router.put('/')
async def update_new_project(authorization: Annotated[str | None, Header()],
                             name: str = Form(...),
                             project_id: str = Form(...),
                             db: Session = Depends(get_db)):
    user = await check_if_user_exists(authorization, db)
    if not user:
        raise HTTPException(status_code=404, detail="User not found, are you logged in?")
    try:
        _project = db.query(P).filter(P.id == project_id, P.owner_id == user.id).update({P.name: name})
    except Exception as e:
        raise HTTPException(status_code=404, detail="Project not found.")
    db.commit()

    return {'status': http.HTTPStatus.OK}


@router.get('/{project_id}', status_code=status.HTTP_200_OK)
async def get_project_files(project_id, authorization: Annotated[str | None, Header()], db: Session = Depends(get_db)):
    user = await check_if_user_exists(authorization, db)
    if not user:
        raise HTTPException(status_code=404, detail="User not found, are you logged in?")

    res = db.query(U).join(P).filter(P.owner_id == user.id).join(F).filter(F.project_id == project_id).join(T).filter(T.id == F.tag_id).with_entities(F,T).all()
    return {'status': http.HTTPStatus.OK, 'files': res}


@router.delete('/{project_id}', status_code=status.HTTP_200_OK)
async def delete_project(project_id, authorization: Annotated[str | None, Header()], db: Session = Depends(get_db)):
    user = await check_if_user_exists(authorization, db)

    if not user:
        raise HTTPException(status_code=404, detail="User not found, are you logged in?")
    project = db.query(P).filter(P.id == project_id, P.owner_id == user.id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project/user combination not found, are you the owner?")
    name = project.name
    files_of_project = db.query(F).filter(F.project_id == project_id).all()
    for file in files_of_project:
        await deleteFile(file.path)

    db.delete(project)
    db.commit()

    return {'status': http.HTTPStatus.OK, 'message': f"Project {name} and related files successfully removed"}
