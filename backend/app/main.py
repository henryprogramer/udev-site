"""Aplicacao principal FastAPI com autenticacao, RBAC e APIs da loja."""

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.admin import router as admin_router
from app.api.auth import router as auth_router
from app.api.downloads import router as downloads_router
from app.api.orders import router as orders_router
from app.api.products import router as products_router
from app.api.webhook import router as webhook_router
from app.core.config import settings
from app.db.session import init_db


@asynccontextmanager
async def lifespan(_: FastAPI):
    """Inicializa banco/schema e usuario gestor ao subir a API."""
    init_db()
    yield


app = FastAPI(title="Loja API Udev", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[origin.strip() for origin in settings.CORS_ORIGINS.split(",") if origin.strip()],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(products_router, prefix="/api", tags=["products"])
app.include_router(orders_router, prefix="/api", tags=["orders"])
app.include_router(admin_router)
app.include_router(webhook_router, tags=["webhook"])
app.include_router(downloads_router, tags=["downloads"])


@app.get("/health")
def healthcheck() -> dict:
    """Endpoint simples para verificar se a API esta ativa."""
    return {"status": "ok", "mode": "auth-enabled"}
