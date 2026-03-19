import logging
import time
from typing import Any, cast

import httpx
from jose import JWTError, jwt

from app.config import settings
from app.exceptions import UnauthorizedException

logger = logging.getLogger(__name__)

_JWKS_CACHE_TTL_SECONDS = 300.0
_jwks_cache: dict[str, tuple[dict[str, object], float]] = {}


async def fetch_jwks(jwks_url: str) -> dict[str, object]:
    cached_jwks = _jwks_cache.get(jwks_url)
    if cached_jwks is not None and cached_jwks[1] > time.monotonic():
        return cached_jwks[0]

    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            response = await client.get(jwks_url)
            response.raise_for_status()
    except httpx.HTTPError as exc:
        logger.error(
            "Failed to fetch Supabase JWKS",
            extra={"jwks_url": jwks_url},
            exc_info=True,
        )
        raise UnauthorizedException(detail="Unable to verify token") from exc

    payload = response.json()
    if not isinstance(payload, dict):
        raise UnauthorizedException(detail="Invalid JWKS response")

    keys = payload.get("keys")
    if not isinstance(keys, list):
        raise UnauthorizedException(detail="Invalid JWKS response")

    _jwks_cache[jwks_url] = (payload, time.monotonic() + _JWKS_CACHE_TTL_SECONDS)
    return payload


async def verify_supabase_access_token(token: str) -> dict[str, Any]:
    try:
        header = jwt.get_unverified_header(token)
        claims = jwt.get_unverified_claims(token)
    except JWTError as exc:
        raise UnauthorizedException(detail="Invalid token") from exc

    algorithm = header.get("alg")
    if algorithm != "ES256":
        logger.warning(
            "Unsupported Supabase token algorithm",
            extra={"algorithm": algorithm},
        )
        raise UnauthorizedException(detail="Unsupported token signing algorithm")

    issuer = claims.get("iss")
    if issuer != settings.supabase_issuer:
        logger.warning(
            "Supabase token issuer mismatch",
            extra={"issuer": issuer},
        )
        raise UnauthorizedException(detail="Invalid token issuer")

    jwks = await fetch_jwks(settings.supabase_jwks_url)

    try:
        claims = jwt.decode(
            token,
            jwks,
            algorithms=["ES256"],
            issuer=settings.supabase_issuer,
            options={"verify_aud": False},
        )
        return cast(dict[str, Any], claims)
    except JWTError as exc:
        logger.warning(
            "Supabase JWT verification failed",
            extra={"issuer": issuer, "algorithm": algorithm, "error": str(exc)},
        )
        raise UnauthorizedException(detail="Invalid or expired token") from exc
