FROM nokal/simod:4.0.3

# Prevents Python from writing pyc files.
ENV PYTHONDONTWRITEBYTECODE=1

# Keeps Python from buffering stdout and stderr to avoid situations where
# the application crashes without emitting any logs due to buffering.
ENV PYTHONUNBUFFERED=1

WORKDIR /usr/src/worker

# Copy the source code into the container.
COPY . .

# Install the local dependencies
RUN python3 -m pip install .

# Run the application.
CMD python3 bps_discovery_simod/main.py
