# syntax=docker/dockerfile:1

# Comments are provided throughout this file to help you get started.
# If you need more help, visit the Dockerfile reference guide at
# https://docs.docker.com/engine/reference/builder/

ARG PYTHON_VERSION=3.9.18
FROM python:${PYTHON_VERSION}-slim as base

# Prevents Python from writing pyc files.
ENV PYTHONDONTWRITEBYTECODE=1

# Keeps Python from buffering stdout and stderr to avoid situations where
# the application crashes without emitting any logs due to buffering.
ENV PYTHONUNBUFFERED=1

WORKDIR /app

# Create a non-privileged user that the app will run under.
# See https://docs.docker.com/develop/develop-images/dockerfile_best-practices/#user
ARG UID=10001
RUN adduser \
    --disabled-password \
    --gecos "" \
    --home "/nonexistent" \
    --shell "/sbin/nologin" \
    --no-create-home \
    --uid "${UID}" \
    appuser

# Copy the source code into the container.
COPY . .

# Install the local dependencies
RUN python -m pip install .

# Switch to the non-privileged user to run the application.
USER appuser

# Expose the port that the application listens on.
EXPOSE 8000

# Run the application.
CMD opentelemetry-instrument --log_level debug uvicorn users.app:app --lifespan on --host=0.0.0.0 --port=8000 --log-level=info --proxy-headers --workers 2 --root-path=/api/v1
