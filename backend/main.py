import os

from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from src.routers import project, file, user
from dotenv import load_dotenv
app = FastAPI()

origins = [
    "http://localhost:5173",
    "http://localhost",
    "http://localhost:80",
    "http://pix.cloud.ut.ee",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(file.router, tags=['Files'], prefix="/api/files")
app.include_router(user.router, tags=['Users'], prefix="/api/users")
app.include_router(project.router, tags=['Projects'], prefix="/api/projects")

@app.get('/api/healthchecker')
def root():
    return {'message': 'Hello World'}
