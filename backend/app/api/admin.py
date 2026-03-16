"""Rotas administrativas protegidas para equipe gestora."""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_manager_user
from app.db.models import Banner, Product, User
from app.db.session import get_db
from app.schemas.product import ProductCreate, ProductOut, ProductUpdate

router = APIRouter(prefix="/admin", tags=["admin"])


@router.get("/products", response_model=list[ProductOut])
def admin_list_products(
    _: User = Depends(get_manager_user), db: Session = Depends(get_db)
) -> list[ProductOut]:
    """Lista produtos no portal de gestao."""
    products = db.query(Product).order_by(Product.id.desc()).all()
    return [ProductOut.model_validate(item) for item in products]


@router.post("/products", response_model=ProductOut, status_code=status.HTTP_201_CREATED)
def admin_create_product(
    payload: ProductCreate,
    _: User = Depends(get_manager_user),
    db: Session = Depends(get_db),
) -> ProductOut:
    """Cria produto no portal admin."""
    product = Product(
        name=payload.name.strip(),
        description=payload.description,
        price=payload.price,
        video_url=payload.video_url,
    )
    db.add(product)
    db.commit()
    db.refresh(product)
    return ProductOut.model_validate(product)


@router.put("/products/{product_id}", response_model=ProductOut)
def admin_update_product(
    product_id: int,
    payload: ProductUpdate,
    _: User = Depends(get_manager_user),
    db: Session = Depends(get_db),
) -> ProductOut:
    """Atualiza produto no portal admin."""
    product = db.query(Product).filter(Product.id == product_id).first()
    if product is None:
        raise HTTPException(status_code=404, detail="Produto nao encontrado")

    update_data = payload.model_dump(exclude_unset=True)
    if "name" in update_data and isinstance(update_data["name"], str):
        update_data["name"] = update_data["name"].strip()

    for key, value in update_data.items():
        setattr(product, key, value)

    db.add(product)
    db.commit()
    db.refresh(product)
    return ProductOut.model_validate(product)


@router.delete("/products/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
def admin_delete_product(
    product_id: int,
    _: User = Depends(get_manager_user),
    db: Session = Depends(get_db),
) -> None:
    """Remove produto no portal admin."""
    product = db.query(Product).filter(Product.id == product_id).first()
    if product is None:
        raise HTTPException(status_code=404, detail="Produto nao encontrado")

    db.delete(product)
    db.commit()


@router.get("/banners")
def admin_list_banners(
    _: User = Depends(get_manager_user), db: Session = Depends(get_db)
) -> dict:
    """Lista banners do portal admin."""
    items = db.query(Banner).order_by(Banner.id.desc()).all()
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


@router.post("/banners", status_code=status.HTTP_201_CREATED)
def admin_create_banner(
    payload: dict,
    _: User = Depends(get_manager_user),
    db: Session = Depends(get_db),
) -> dict:
    """Cria banner no portal admin."""
    banner = Banner(
        title=(payload.get("title") or "").strip() or None,
        image_url=(payload.get("image_url") or "").strip() or None,
        is_active=bool(payload.get("is_active", True)),
    )
    db.add(banner)
    db.commit()
    db.refresh(banner)
    return {
        "id": banner.id,
        "title": banner.title,
        "image_url": banner.image_url,
        "is_active": banner.is_active,
    }


@router.put("/banners/{banner_id}")
def admin_update_banner(
    banner_id: int,
    payload: dict,
    _: User = Depends(get_manager_user),
    db: Session = Depends(get_db),
) -> dict:
    """Atualiza banner no portal admin."""
    banner = db.query(Banner).filter(Banner.id == banner_id).first()
    if banner is None:
        raise HTTPException(status_code=404, detail="Banner nao encontrado")

    if "title" in payload:
        banner.title = (payload.get("title") or "").strip() or None
    if "image_url" in payload:
        banner.image_url = (payload.get("image_url") or "").strip() or None
    if "is_active" in payload:
        banner.is_active = bool(payload.get("is_active"))

    db.add(banner)
    db.commit()
    db.refresh(banner)
    return {
        "id": banner.id,
        "title": banner.title,
        "image_url": banner.image_url,
        "is_active": banner.is_active,
    }


@router.delete("/banners/{banner_id}", status_code=status.HTTP_204_NO_CONTENT)
def admin_delete_banner(
    banner_id: int,
    _: User = Depends(get_manager_user),
    db: Session = Depends(get_db),
) -> None:
    """Remove banner no portal admin."""
    banner = db.query(Banner).filter(Banner.id == banner_id).first()
    if banner is None:
        raise HTTPException(status_code=404, detail="Banner nao encontrado")

    db.delete(banner)
    db.commit()
