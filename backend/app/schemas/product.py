"""Schemas de produto para API publica e admin."""

from pydantic import BaseModel, Field


class ProductBase(BaseModel):
    """Campos compartilhados de produto."""

    name: str = Field(min_length=2, max_length=255)
    description: str | None = Field(default=None, max_length=5000)
    price: float = Field(default=0, ge=0)
    video_url: str | None = Field(default=None, max_length=500)


class ProductCreate(ProductBase):
    """Payload de criacao de produto."""


class ProductUpdate(BaseModel):
    """Payload parcial de atualizacao de produto."""

    name: str | None = Field(default=None, min_length=2, max_length=255)
    description: str | None = Field(default=None, max_length=5000)
    price: float | None = Field(default=None, ge=0)
    video_url: str | None = Field(default=None, max_length=500)


class ProductOut(ProductBase):
    """Representacao de produto."""

    id: int

    model_config = {"from_attributes": True}
