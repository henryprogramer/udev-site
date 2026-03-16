"""Schemas de banner (placeholder)."""

from pydantic import BaseModel


class BannerOut(BaseModel):
    """Representação pública de banner."""

    id: int
    title: str | None = None
    image_url: str | None = None
