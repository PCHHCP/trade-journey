import base64
import time

import pytest
from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.primitives.asymmetric import ec
from jose import jwt

from app.config import settings
from app.exceptions import UnauthorizedException
from app.services.supabase_auth import verify_supabase_access_token


def _base64url_uint(value: int) -> str:
    raw = value.to_bytes(32, byteorder="big")
    return base64.urlsafe_b64encode(raw).rstrip(b"=").decode("ascii")


def _generate_es256_key_pair() -> tuple[str, dict[str, str]]:
    private_key = ec.generate_private_key(ec.SECP256R1())
    private_pem = private_key.private_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PrivateFormat.PKCS8,
        encryption_algorithm=serialization.NoEncryption(),
    ).decode("utf-8")

    public_numbers = private_key.public_key().public_numbers()
    public_jwk = {
        "kty": "EC",
        "crv": "P-256",
        "alg": "ES256",
        "use": "sig",
        "kid": "test-key",
        "x": _base64url_uint(public_numbers.x),
        "y": _base64url_uint(public_numbers.y),
    }
    return private_pem, public_jwk


@pytest.mark.anyio
async def test_verify_supabase_access_token_accepts_es256(monkeypatch: pytest.MonkeyPatch) -> None:
    private_pem, public_jwk = _generate_es256_key_pair()
    monkeypatch.setattr(settings, "supabase_url", "https://example.supabase.co")

    async def fake_fetch_jwks(_: str) -> dict[str, object]:
        return {"keys": [public_jwk]}

    monkeypatch.setattr("app.services.supabase_auth.fetch_jwks", fake_fetch_jwks)

    token = jwt.encode(
        {
            "sub": "user-123",
            "email": "user@example.com",
            "iss": settings.supabase_issuer,
            "exp": int(time.time()) + 3600,
        },
        private_pem,
        algorithm="ES256",
        headers={"kid": "test-key"},
    )

    claims = await verify_supabase_access_token(token)

    assert claims["sub"] == "user-123"
    assert claims["email"] == "user@example.com"


@pytest.mark.anyio
async def test_verify_supabase_access_token_rejects_hs256(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setattr(settings, "supabase_url", "https://example.supabase.co")

    token = jwt.encode(
        {
            "sub": "user-123",
            "email": "user@example.com",
            "iss": settings.supabase_issuer,
            "exp": int(time.time()) + 3600,
        },
        "legacy-secret",
        algorithm="HS256",
    )

    with pytest.raises(UnauthorizedException, match="Unsupported token signing algorithm"):
        await verify_supabase_access_token(token)
