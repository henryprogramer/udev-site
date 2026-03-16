"""Rotas de autenticacao para clientes e equipe gestora."""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.security import create_access_token, hash_password, verify_password
from app.db.models import User
from app.db.session import get_db
from app.schemas.user import AuthTokenOut, UserLogin, UserOut, UserRegister

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/register", response_model=AuthTokenOut, status_code=status.HTTP_201_CREATED)
def register_user(payload: UserRegister, db: Session = Depends(get_db)) -> AuthTokenOut:
    """Cadastro de cliente com retorno de token."""
    email = payload.email.strip().lower()
    existing = db.query(User).filter(User.email == email).first()
    if existing:
        raise HTTPException(status_code=409, detail="E-mail ja cadastrado")

    user = User(
        full_name=payload.full_name.strip(),
        email=email,
        password_hash=hash_password(payload.password),
        role="client",
        is_active=True,
        is_admin=False,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token(
        {
            "sub": user.email,
            "user_id": user.id,
            "role": user.role,
        }
    )

    return AuthTokenOut(access_token=token, user=UserOut.model_validate(user))


@router.post("/login", response_model=AuthTokenOut)
def login_user(payload: UserLogin, db: Session = Depends(get_db)) -> AuthTokenOut:
    """Login com email e senha."""
    email = payload.email.strip().lower()
    user = db.query(User).filter(User.email == email).first()

    if user is None or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Credenciais invalidas")

    if not user.is_active:
        raise HTTPException(status_code=403, detail="Conta inativa")

    token = create_access_token(
        {
            "sub": user.email,
            "user_id": user.id,
            "role": user.role,
        }
    )

    return AuthTokenOut(access_token=token, user=UserOut.model_validate(user))


@router.get("/me", response_model=UserOut)
def me(current_user: User = Depends(get_current_user)) -> UserOut:
    """Retorna usuario autenticado atual."""
    return UserOut.model_validate(current_user)
