FROM python:3.9-slim

WORKDIR /app
COPY . .

RUN pip install --upgrade pip
RUN pip install .

EXPOSE 8000

CMD ["gunicorn", "-w", "2", "kronos.app:app", "-b", "0.0.0.0:8000"]
