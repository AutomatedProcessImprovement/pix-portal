import http
import pathlib
from typing import Annotated

from fastapi import APIRouter, Depends, UploadFile, status, File, Form, Header, HTTPException
from sqlalchemy import text
from sqlalchemy.orm import Session

from src.auth.decrypt import check_if_user_exists
from src.database.database import get_db
from src.models.models import File as F, Tag as T, User as U, Project as P
from src.disk_storage.filestore import uploadFile, deleteFile
from urllib.request import pathname2url
from urllib.parse import urljoin
from fastapi.responses import FileResponse

router = APIRouter()


@router.get('/', status_code=status.HTTP_200_OK)
async def get_file_for_download(file_path):
    try:
        return FileResponse(file_path)
    except Exception as e:
        return str(e), 400


@router.put('/')
async def update_existing_file(authorization: Annotated[str | None, Header()],
                       name: str = Form(...),
                       file_id: str = Form(...),
                       db: Session = Depends(get_db)):
    user = await check_if_user_exists(authorization, db)
    if not user:
        raise HTTPException(status_code=404, detail="User not found, are you logged in?")

    _project = db.query(P).filter(P.owner_id == user.id).first()
    if not _project:
        raise HTTPException(status_code=404, detail="Project/ User combination not found, are you logged in?")

    try:
        _file = db.query(F).filter(F.id == file_id, F.project_id == _project.id).update({F.name: name})
    except Exception as e:
        raise HTTPException(status_code=404, detail="Something went wrong.")
    db.commit()

    return {'status': http.HTTPStatus.OK, 'message': f"File successfully renamed"}


@router.delete('/{file_id}', status_code=status.HTTP_200_OK)
async def delete_project(file_id, authorization: Annotated[str | None, Header()], db: Session = Depends(get_db)):
    user = await check_if_user_exists(authorization, db)
    if not user:
        raise HTTPException(status_code=404, detail="User not found, are you logged in?")

    file = db.query(F, P).filter(F.id == file_id, P.id == F.project_id, P.owner_id == user.id).with_entities(F).first()
    if not file:
        raise HTTPException(status_code=404, detail="File/Project/User combination not found, are you the owner?")
    name = file.name
    _deleted = await deleteFile(file.path)
    db.delete(file)
    db.commit()

    return {'status': http.HTTPStatus.OK, 'message': f"File {name} successfully removed"}


@router.post('/', status_code=status.HTTP_201_CREATED)
async def upload_file(
        file: UploadFile = File(...),
        tag: str = Form(...),
        project_id: str = Form(...),
        db: Session = Depends(get_db)
):
    # Create new models.File object from UploadFile
    _newfile = F(name='_'.join(file.filename.split('.')[:-1]), extension=file.filename.split(".")[-1])

    # Find TAG value in database
    _tag = T(value=tag)
    if _tag.value.strip() == "":
        _tag.value = "UNTAGGED"

    _db_tag = db.query(T).filter_by(value=_tag.value).first()

    if not _db_tag:
        raise HTTPException(status_code=404, detail="Tag type not found. Please contact the developers.")
    else:
        _newfile.tag = _db_tag

    file_path = await uploadFile(file)
    _newfile.path = file_path

    _newfile.project_id = project_id

    db.add(_newfile)
    db.commit()

    return {'status': http.HTTPStatus.OK, 'message': 'File successfully uploaded'}
