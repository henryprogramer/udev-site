"""Rotas publicas de produtos, banners e midias."""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.models import Banner, Media, Product
from app.db.session import get_db
from app.schemas.product import ProductOut

router = APIRouter()


@router.get("/products", response_model=list[ProductOut])
def list_products(db: Session = Depends(get_db)) -> list[ProductOut]:
    """Retorna lista publica de produtos."""
    products = db.query(Product).order_by(Product.id.desc()).all()
    return [ProductOut.model_validate(item) for item in products]


@router.get("/products/{product_id}", response_model=ProductOut)
def get_product(product_id: int, db: Session = Depends(get_db)) -> ProductOut:
    """Retorna detalhe publico do produto."""
    product = db.query(Product).filter(Product.id == product_id).first()
    if product is None:
        from fastapi import HTTPException

        raise HTTPException(status_code=404, detail="Produto nao encontrado")

    return ProductOut.model_validate(product)


@router.get("/banners")
def list_banners(db: Session = Depends(get_db)) -> dict:
    """Retorna banners ativos."""
    items = (
        db.query(Banner)
        .filter(Banner.is_active.is_(True))
        .order_by(Banner.id.desc())
        .all()
    )
    return {
        "items": [
            {
                "id": item.id,
                "title": item.title,
                "image_url": item.image_url,
                "is_active": item.is_active,
            }
            for item in items
        ]
    }


@router.get("/media")
def list_media(db: Session = Depends(get_db), product_id: int | None = None) -> dict:
    """Retorna midias publicas, opcionalmente filtradas por produto."""
    query = db.query(Media)
    if product_id is not None:
        query = query.filter(Media.product_id == product_id)

    items = query.order_by(Media.id.desc()).all()
    return {
        "items": [
            {
                "id": item.id,
                "product_id": item.product_id,
                "media_type": item.media_type,
                "path_or_url": item.path_or_url,
            }
            for item in items
        ]
    }
