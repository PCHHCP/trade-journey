import logging
from collections.abc import AsyncGenerator

from fastapi import Depends
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import AsyncSessionLocal
from app.exceptions import UnauthorizedException
from app.models.user import User
from app.services.supabase_auth import verify_supabase_access_token
from app.services.user import UserService

logger = logging.getLogger(__name__)

security = HTTPBearer()


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with AsyncSessionLocal() as session:
        yield session


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncSession = Depends(get_db),
) -> User:
    token = credentials.credentials

    payload = await verify_supabase_access_token(token)

    sub: str | None = payload.get("sub")
    email: str | None = payload.get("email")

    if not sub or not email:
        raise UnauthorizedException(detail="Invalid token claims")

    user_metadata: dict[str, str] = payload.get("user_metadata", {})
    display_name: str | None = user_metadata.get("full_name") or user_metadata.get("name")

    service = UserService(db)
    user = await service.get_or_create_user(
        supabase_user_id=sub,
        email=email,
        display_name=display_name,
    )
    return user
