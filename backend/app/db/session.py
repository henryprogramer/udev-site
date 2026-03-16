"""Configuracao de engine/sessao SQLAlchemy com bootstrap de schema."""

from __future__ import annotations

from sqlalchemy import create_engine, inspect, text
from sqlalchemy.engine import Engine
from sqlalchemy.orm import sessionmaker

from app.core.config import settings
from app.core.security import hash_password
from app.db.models import Base, User

connect_args = {"check_same_thread": False} if settings.DATABASE_URL.startswith("sqlite") else {}
engine = create_engine(settings.DATABASE_URL, future=True, connect_args=connect_args)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)


def _ensure_users_columns(engine_: Engine) -> None:
    """Garante colunas novas de auth/role em bases antigas."""
    inspector = inspect(engine_)
    if "users" not in inspector.get_table_names():
        return

    columns = {column["name"] for column in inspector.get_columns("users")}
    statements: list[str] = []

    if "full_name" not in columns:
        statements.append("ALTER TABLE users ADD COLUMN full_name VARCHAR(255)")
    if "password_hash" not in columns:
        statements.append("ALTER TABLE users ADD COLUMN password_hash VARCHAR(255)")
    if "role" not in columns:
        statements.append("ALTER TABLE users ADD COLUMN role VARCHAR(50) DEFAULT 'client'")
    if "is_active" not in columns:
        statements.append("ALTER TABLE users ADD COLUMN is_active BOOLEAN DEFAULT TRUE")
    if "is_admin" not in columns:
        statements.append("ALTER TABLE users ADD COLUMN is_admin BOOLEAN DEFAULT FALSE")

    with engine_.begin() as connection:
        for statement in statements:
            connection.execute(text(statement))


def _bootstrap_manager_user() -> None:
    """Cria usuario gestor padrao para acesso inicial ao portal admin."""
    email = settings.BOOTSTRAP_MANAGER_EMAIL.strip().lower()
    password = settings.BOOTSTRAP_MANAGER_PASSWORD
    full_name = settings.BOOTSTRAP_MANAGER_NAME

    if not email or not password:
        return

    db = SessionLocal()
    try:
        user = db.query(User).filter(User.email == email).first()
        if user:
            if user.role != "manager" or not user.is_admin or not user.is_active:
                user.role = "manager"
                user.is_admin = True
                user.is_active = True
                if not user.full_name:
                    user.full_name = full_name
                if not user.password_hash:
                    user.password_hash = hash_password(password)
                db.add(user)
                db.commit()
            return

        manager = User(
            full_name=full_name,
            email=email,
            password_hash=hash_password(password),
            role="manager",
            is_admin=True,
            is_active=True,
        )
        db.add(manager)
        db.commit()
    finally:
        db.close()


def init_db() -> None:
    """Inicializa tabelas e upgrades minimos de schema."""
    Base.metadata.create_all(bind=engine)
    _ensure_users_columns(engine)
    _bootstrap_manager_user()


def get_db():
    """Dependencia de sessao DB para FastAPI."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
