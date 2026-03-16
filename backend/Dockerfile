# Imagem de desenvolvimento do backend FastAPI.
FROM python:3.12-slim

WORKDIR /app
COPY pyproject.toml /app/pyproject.toml
RUN pip install --no-cache-dir fastapi uvicorn sqlalchemy pydantic-settings psycopg[binary]
COPY . /app

EXPOSE 8000
