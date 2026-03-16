"""Modelos SQLAlchemy basicos da loja."""

from datetime import datetime

from sqlalchemy import Boolean, DateTime, ForeignKey, Numeric, String, Text, func
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column


class Base(DeclarativeBase):
    """Base declarativa para os modelos."""


class User(Base):
    """Usuario com suporte a autenticacao e controle de papel."""

    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True)
    full_name: Mapped[str] = mapped_column(String(255), default="Cliente Udev")
    email: Mapped[str] = mapped_column(String(255), unique=True)
    password_hash: Mapped[str] = mapped_column(String(255), default="")
    role: Mapped[str] = mapped_column(String(50), default="client")
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    is_admin: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )


class Product(Base):
    """Produto com suporte opcional a video do YouTube."""

    __tablename__ = "products"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(255))
    description: Mapped[str | None] = mapped_column(Text(), nullable=True)
    price: Mapped[float] = mapped_column(Numeric(10, 2), default=0)
    video_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )


class Banner(Base):
    """Banner promocional com imagem por URL/path."""

    __tablename__ = "banners"

    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str | None] = mapped_column(String(255), nullable=True)
    image_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )


class Media(Base):
    """Midia associada a produto (imagem/path/url)."""

    __tablename__ = "media"

    id: Mapped[int] = mapped_column(primary_key=True)
    product_id: Mapped[int] = mapped_column(ForeignKey("products.id", ondelete="CASCADE"))
    media_type: Mapped[str] = mapped_column(String(50))
    path_or_url: Mapped[str] = mapped_column(String(500))
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )


class Order(Base):
    """Pedido simplificado."""

    __tablename__ = "orders"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int | None] = mapped_column(ForeignKey("users.id"), nullable=True)
    status: Mapped[str] = mapped_column(String(50), default="pending")
    total: Mapped[float] = mapped_column(Numeric(10, 2), default=0)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )


class DownloadToken(Base):
    """Token para download protegido de arquivo."""

    __tablename__ = "downloads_tokens"

    id: Mapped[int] = mapped_column(primary_key=True)
    order_id: Mapped[int] = mapped_column(ForeignKey("orders.id", ondelete="CASCADE"))
    token: Mapped[str] = mapped_column(String(255), unique=True)
    used: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
