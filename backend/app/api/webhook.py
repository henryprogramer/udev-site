"""Webhook de pagamento (placeholder)."""

from fastapi import APIRouter

router = APIRouter()


@router.post("/webhook/payment")
def payment_webhook() -> dict:
    """Recebe confirmação de pagamento (placeholder)."""
    # processar confirmação de pagamento aqui
    return {"received": True, "detail": "TODO: validar assinatura e atualizar pedido"}
