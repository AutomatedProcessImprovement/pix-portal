#!/usr/bin/env bash

WHEEL_PATH=dist/pix_portal_lib-0.1.0-py3-none-any.whl
SERVICE_BASE_DIR=$(realpath ../services)

function build() {
    printf "Building the library\n"
    echo "=============================="
    source .venv/bin/activate
    poetry build
}

function update_service_deps() {
    cd $1
    printf "\nUpdating $1\n"
    echo "=============================="
    poetry lock
    poetry install
    poetry export -f requirements.txt --output requirements.txt --without-hashes
    # remove the line containing "pix-portal-lib" from requirements.txt,
    # because it will be installed from the wheel file
    sed -i '' '/pix-portal-lib/d' requirements.txt
}

# main loop

build

for service in $(ls $SERVICE_BASE_DIR); do
    if [[ -d $SERVICE_BASE_DIR/$service/lib ]]; then
        echo "Copying lib to $service"
        cp $WHEEL_PATH $SERVICE_BASE_DIR/$service/lib/
    fi
done

for service in $(ls $SERVICE_BASE_DIR); do
    cd $SERVICE_BASE_DIR
    if [[ -d $service ]]; then
        update_service_deps $service || true
    fi
done