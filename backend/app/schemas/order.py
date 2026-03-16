"""Schemas de pedido."""

from pydantic import BaseModel, Field


class OrderCreate(BaseModel):
    """Payload minimo para criacao de pedido."""

    total: float | None = Field(default=0, ge=0)


class OrderOut(BaseModel):
    """Resposta de pedido criado."""

    order_id: int
    status: str
    total: float = 0
