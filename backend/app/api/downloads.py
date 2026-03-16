"""Rotas de download protegido por token."""

from fastapi import APIRouter

router = APIRouter()


@router.get("/download/{token}")
def protected_download(token: str) -> dict:
    """Verifica token e retorna arquivo ZIP (placeholder)."""
    return {
        "token": token,
        "detail": "TODO: verificar token e entregar ZIP autorizado",
    }
