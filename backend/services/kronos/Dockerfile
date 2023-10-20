FROM python:3.9-slim

WORKDIR /app
COPY . .

RUN pip install --upgrade pip
RUN pip install .

EXPOSE 5000

CMD ["gunicorn", "-w", "4", "kronos.app:app", "-b", "0.0.0.0:5000"]
