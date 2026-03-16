"""Schemas de mídia (placeholder)."""

from pydantic import BaseModel


class MediaOut(BaseModel):
    """Mídia associada ao produto."""

    id: int
    media_type: str
    path_or_url: str
