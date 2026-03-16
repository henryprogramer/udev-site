"""Rotas de pedido com persistencia basica."""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.models import Order, User
from app.db.session import get_db
from app.schemas.order import OrderCreate, OrderOut

router = APIRouter()


@router.post("/orders", response_model=OrderOut)
def create_order(
    payload: OrderCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> OrderOut:
    """Cria um pedido em status pendente para o cliente autenticado."""
    total = payload.total if payload.total is not None else 0
    order = Order(user_id=current_user.id, status="pending", total=total)
    db.add(order)
    db.commit()
    db.refresh(order)

    return OrderOut(order_id=order.id, status=order.status, total=float(order.total))
