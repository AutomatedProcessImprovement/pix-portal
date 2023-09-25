#!/usr/bin/env bash

SERVICE_BASE_DIR=$(realpath ../services)

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

for service in $(ls $SERVICE_BASE_DIR); do
    cd $SERVICE_BASE_DIR
    if [[ -d $service ]]; then
        update_service_deps $service || true
    fi
done
