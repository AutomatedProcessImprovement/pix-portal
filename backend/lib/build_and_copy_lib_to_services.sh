#!/usr/bin/env bash

WHEEL_PATH=dist/pix_portal_lib-0.1.0-py3-none-any.whl
SERVICE_BASE_DIR=../services

source .venv/bin/activate
poetry build

for service in $(ls $SERVICE_BASE_DIR); do
    if [[ -d $SERVICE_BASE_DIR/$service/lib ]]; then
        echo "Copying lib to $service"
        cp $WHEEL_PATH $SERVICE_BASE_DIR/$service/lib/
    fi
done
