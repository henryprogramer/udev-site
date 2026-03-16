"""Dependencias de autenticacao e autorizacao da API."""

from __future__ import annotations

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app.core.security import AuthError, decode_access_token
from app.db.models import User
from app.db.session import get_db

bearer_scheme = HTTPBearer(auto_error=False)


def _unauthorized(detail: str) -> HTTPException:
    return HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail=detail,
        headers={"WWW-Authenticate": "Bearer"},
    )


def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
    db: Session = Depends(get_db),
) -> User:
    """Retorna usuario autenticado via Bearer token."""
    if credentials is None:
        raise _unauthorized("Token de acesso ausente")

    try:
        payload = decode_access_token(credentials.credentials)
    except AuthError as exc:
        raise _unauthorized(str(exc)) from exc

    user_id = payload.get("user_id")
    if not isinstance(user_id, int):
        raise _unauthorized("Token invalido")

    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise _unauthorized("Usuario nao encontrado")

    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Conta inativa")

    return user


def get_manager_user(current_user: User = Depends(get_current_user)) -> User:
    """Exige role de gestao para rotas administrativas."""
    if current_user.role != "manager" and not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Acesso restrito a equipe gestora",
        )
    return current_user
