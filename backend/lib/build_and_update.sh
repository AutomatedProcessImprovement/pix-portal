#!/usr/bin/env bash

WHEEL_PATH=""
SERVICE_BASE_DIR=$(realpath ../services)
WORKER_BASE_DIR=$(realpath ../workers)
CWD=$(pwd)

function build() {
    printf "Building the library\n"
    echo "=============================="
    source .venv/bin/activate

    WHEEL_PATH="dist/pix_portal_lib-$(poetry version -s)-py3-none-any.whl"
    echo "Wheel path: $WHEEL_PATH"

    poetry build
}

function update_poetry() {
    cd $1
    printf "\nUpdating $1\n"
    echo "=============================="
    source .venv/bin/activate
    poetry lock
    poetry install
    poetry export -f requirements.txt --output requirements.txt --without-hashes
    # remove the line containing "pix-portal-lib" from requirements.txt,
    # because it will be installed from the wheel file
    sed -i '' '/pix-portal-lib/d' requirements.txt
}

# main loop

build

printf "\nCopying lib to services $1\n"
echo "=============================="
for service in $(ls $SERVICE_BASE_DIR); do
    if [[ -d $SERVICE_BASE_DIR/$service/lib ]]; then
        echo "Removing old lib from $service"
        rm $SERVICE_BASE_DIR/$service/lib/pix_portal_lib-*.whl
        echo "Copying lib to $service"
        cp $WHEEL_PATH $SERVICE_BASE_DIR/$service/lib/
    fi
done

for service in $(ls $SERVICE_BASE_DIR); do
    cd $SERVICE_BASE_DIR
    if [[ -d $service ]]; then
        update_poetry $service || true
    fi
    cd $CWD
done

printf "\nCopying lib to workers $1\n"
echo "=============================="
for worker in $(ls $WORKER_BASE_DIR); do
    if [[ -d $WORKER_BASE_DIR/$worker/lib ]]; then
        echo "Removing old lib from $worker"
        rm $WORKER_BASE_DIR/$worker/lib/pix_portal_lib-*.whl
        echo "Copying lib to $worker"
        cp $WHEEL_PATH $WORKER_BASE_DIR/$worker/lib/
    fi
done

for worker in $(ls $WORKER_BASE_DIR); do
    cd $WORKER_BASE_DIR
    if [[ -d $worker ]]; then
        update_poetry $worker || true
    fi
    cd $CWD
done