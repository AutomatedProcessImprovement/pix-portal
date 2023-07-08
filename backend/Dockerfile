# Use the official Python base image
FROM python:3.9

# Set the working directory inside the container
WORKDIR /app

# Copy the poetry.lock and pyproject.toml files to the container
COPY poetry.lock pyproject.toml ./

# Install poetry
RUN pip install poetry

# Install project dependencies
RUN poetry config virtualenvs.create false && poetry install --no-dev

# Copy the rest of the application code to the container
COPY . .

# Expose port 8000 for the application
EXPOSE 8000

# Set the command to run your application with uvicorn
CMD ["poetry", "run", "uvicorn", "your_module:app", "--host", "0.0.0.0", "--port", "8000"]