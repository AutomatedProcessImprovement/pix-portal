#!/usr/bin/env bash

docker run --rm -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=pix -d -p 5432:5432 postgres
uvicorn api_server.app:app --reload --port 8000 --lifespan on --env-file .env
