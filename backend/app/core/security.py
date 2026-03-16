"""Utilitarios de seguranca: hash de senha e token de acesso assinado."""

from __future__ import annotations

import base64
import hashlib
import hmac
import json
import secrets
import time
from typing import Any

from app.core.config import settings

PBKDF2_ITERATIONS = 390_000


class AuthError(ValueError):
    """Erro para token/senha invalidos."""


def _b64url_encode(raw: bytes) -> str:
    return base64.urlsafe_b64encode(raw).rstrip(b"=").decode("ascii")


def _b64url_decode(value: str) -> bytes:
    padding = "=" * ((4 - len(value) % 4) % 4)
    return base64.urlsafe_b64decode((value + padding).encode("ascii"))


def hash_password(password: str) -> str:
    """Gera hash PBKDF2 da senha com salt aleatorio."""
    salt = secrets.token_bytes(16)
    digest = hashlib.pbkdf2_hmac(
        "sha256", password.encode("utf-8"), salt, PBKDF2_ITERATIONS
    )
    return (
        f"pbkdf2_sha256${PBKDF2_ITERATIONS}$"
        f"{salt.hex()}${digest.hex()}"
    )


def verify_password(password: str, stored_hash: str) -> bool:
    """Valida senha contra hash armazenado."""
    try:
        scheme, iterations_str, salt_hex, digest_hex = stored_hash.split("$", 3)
        if scheme != "pbkdf2_sha256":
            return False
        iterations = int(iterations_str)
    except ValueError:
        return False

    computed = hashlib.pbkdf2_hmac(
        "sha256",
        password.encode("utf-8"),
        bytes.fromhex(salt_hex),
        iterations,
    )
    return hmac.compare_digest(computed.hex(), digest_hex)


def create_access_token(payload: dict[str, Any], expires_minutes: int | None = None) -> str:
    """Cria token assinado no formato JWT simplificado (HS256)."""
    now = int(time.time())
    exp_minutes = expires_minutes or settings.ACCESS_TOKEN_EXPIRE_MINUTES

    complete_payload = {
        **payload,
        "iat": now,
        "exp": now + (exp_minutes * 60),
    }

    header = {"alg": "HS256", "typ": "JWT"}

    header_b64 = _b64url_encode(json.dumps(header, separators=(",", ":")).encode("utf-8"))
    payload_b64 = _b64url_encode(
        json.dumps(complete_payload, separators=(",", ":")).encode("utf-8")
    )
    signing_input = f"{header_b64}.{payload_b64}".encode("ascii")

    signature = hmac.new(
        settings.SECRET_KEY.encode("utf-8"), signing_input, hashlib.sha256
    ).digest()
    signature_b64 = _b64url_encode(signature)

    return f"{header_b64}.{payload_b64}.{signature_b64}"


def decode_access_token(token: str) -> dict[str, Any]:
    """Decodifica e valida token assinado."""
    try:
        header_b64, payload_b64, signature_b64 = token.split(".", 2)
    except ValueError as exc:
        raise AuthError("Formato de token invalido") from exc

    signing_input = f"{header_b64}.{payload_b64}".encode("ascii")
    expected_signature = hmac.new(
        settings.SECRET_KEY.encode("utf-8"), signing_input, hashlib.sha256
    ).digest()

    try:
        received_signature = _b64url_decode(signature_b64)
    except Exception as exc:  # noqa: BLE001
        raise AuthError("Assinatura invalida") from exc

    if not hmac.compare_digest(expected_signature, received_signature):
        raise AuthError("Assinatura invalida")

    try:
        payload_raw = _b64url_decode(payload_b64)
        payload = json.loads(payload_raw)
    except Exception as exc:  # noqa: BLE001
        raise AuthError("Payload invalido") from exc

    exp = payload.get("exp")
    if not isinstance(exp, int) or exp < int(time.time()):
        raise AuthError("Token expirado")

    return payload
