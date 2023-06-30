from pprint import pprint
from typing import Union, Annotated

import psycopg2
from fastapi import FastAPI, UploadFile, File, Form
from database import db_session
from pydantic import BaseModel, FilePath
from fastapi.middleware.cors import CORSMiddleware
from models.models import File as F, Tag as T, Project, FileTag as FT, User as U
from sqlalchemy import literal_column, text
from sqlalchemy import BigInteger, cast
from helpers.password_gen import generateOTP

from collections import namedtuple

import requests
import json

app = FastAPI()

origins = [
    "http://localhost:5173",
    "http://localhost",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/register/")
async def home(
        username: str = Form(...),
        firstname: str = Form(...),
        lastname: str = Form(...),
        email: str = Form(...)
):
    otp = generateOTP()

    url = "http://localhost:8080/v2alpha/users/human"
    payload = json.dumps({
        "username": username,
        "profile": {
            "firstName": firstname,
            "lastName": lastname,
            "nickName": firstname,
            "displayName": firstname + " " + lastname,
            "preferredLanguage": "en"
        },
        "email": {
            "email": email,
            "isVerified": True
        },
        "password": {
            "password": otp,
            "changeRequired": True
        }
    })
    headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': 'Bearer dGdrLUC2RyTxLiz3ICKJgZqa7RVrpS50MfPGZzOWQE1O-MzODSa-q9P0hO9630UGCk1aokc'
    }

    response = requests.request("POST", url, headers=headers, data=payload)

    print(response.text)

    return {"message": response.text, "otp": otp}


@app.get("/")
async def home():
    return {"message": "Hello World"}


@app.get("/file/")
async def home(fileId):
    print(fileId)

    result = db_session.query(F).filter(F.id == fileId).first()

    file_name = result.name
    file_content = result.content

    return {"file": {'content': file_content, 'name': file_name}}


@app.get("/projects/")
async def get_all_projects(uuid):
    print(uuid)
    result = db_session.query(Project).filter(Project.user_id == uuid).all()

    print(result)

    return {"projects": result}


@app.get("/projects/{project_id}")
async def get_project_files(project_id):
    print(project_id)
    values = {'project_id': project_id}
    query = text('select file.id, file.name, file.\"createdOn\", file.project_id, ' +
                 'array_agg(distinct tag.value::text) as tags ' +
                 'from file inner join "fileTag" on file.id = "fileTag"."fileId"' +
                 ' inner join tag on "fileTag"."tagId" = tag.id ' +
                 'where file.project_id = :project_id ' +
                 'group by file.id'
                 )
    # projects = db_session.query(F).filter_by(project_id=project_id).all()
    res = db_session.execute(query, values)
    _dict = res.mappings().all()
    pprint(_dict)

    return {"files": _dict}


@app.delete("/projects/remove/{pid}")
async def remove_file(
        pid: int
):
    print(pid)

    project = db_session.get(Project, pid)
    db_session.delete(project)
    db_session.commit()
    # file = db_session.get(F, fid)
    # print(file)
    # db_session.delete(file)
    # db_session.remove(file)
    # db_session.commit()

    return {"message": "Project and related files successfully removed."}


@app.delete("/files/remove/{fid}")
async def remove_file(
        fid: int
):
    print(fid)
    file = db_session.get(F, fid)
    print(file)
    db_session.delete(file)
    # db_session.remove(file)
    db_session.commit()

    return {"message": "File successfully removed"}

@app.put("/files/")
async def update_file_name(
        fid: str = Form(...),
        name: str = Form(...)
):
    _file = db_session.query(F).filter_by(id=fid).update({F.name: name})
    db_session.commit()

    return {"message": "File successfully updated"}


@app.put("/projects/")
async def update_project(
        uuid: str = Form(...),
        pid: str = Form(...),
        name: str = Form(...)
):
    user = db_session.query(U.uuid).filter_by(uuid=uuid).first() is not None
    if not user:
        # TODO ERROR
        return {"message": "User does not exist"}

    _project = db_session.query(Project).filter_by(id=pid).update({Project.name: name})
    db_session.commit()

    return {"message": "Project successfully updated"}


@app.post("/projects/")
async def create_project(
        uuid: str = Form(...),
        name: str = Form(...)
):
    user = db_session.query(U.uuid).filter_by(uuid=uuid).first() is not None
    if not user:
        #  CREATE NEW USER
        newUser = U(uuid=uuid)
        db_session.add(newUser)
        db_session.commit()

    _project = Project(name=name)
    _project.user_id = uuid
    db_session.add(_project)
    db_session.commit()

    return {"message": "Project successfully created"}


@app.post("/upload/")
async def upload_file(
        file: UploadFile = File(...),
        name: str = Form(...),
        tags: list[str] = Form(...),
        projectId: int = Form(...)
):
    _file = F(name=name, content=file.file.read())
    # TODO VERIFICATION
    for tag in tags:
        print("##")
        print(tag)
        _tag = T(value=tag)

        if _tag.value.strip() == "":
            _tag.value = "UNTAGGED"

        _tag = db_session.query(T).filter_by(value=_tag.value).first()
        print(_tag)

        if not _tag:
            return {"err": "Tag is not found"}

        _file.tags.append(_tag)

    print(projectId)
    _project = db_session.query(Project).filter_by(id=projectId).first()
    if not _project:
        return {"err": "Project is not found"}
    print(_project)

    _file.project_id = projectId

    print(_file.tags)
    db_session.add(_file)
    db_session.commit()
    return {"message": 'File added ' + file.filename}