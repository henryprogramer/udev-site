"""Schemas de autenticacao e usuario."""

from pydantic import BaseModel, Field


class UserRegister(BaseModel):
    """Payload de cadastro de cliente."""

    full_name: str = Field(min_length=2, max_length=120)
    email: str = Field(min_length=5, max_length=255)
    password: str = Field(min_length=8, max_length=128)


class UserLogin(BaseModel):
    """Payload de login."""

    email: str = Field(min_length=5, max_length=255)
    password: str = Field(min_length=8, max_length=128)


class UserOut(BaseModel):
    """Representacao publica de usuario."""

    id: int
    full_name: str
    email: str
    role: str
    is_active: bool

    model_config = {"from_attributes": True}


class AuthTokenOut(BaseModel):
    """Resposta de autenticacao."""

    access_token: str
    token_type: str = "bearer"
    user: UserOut
