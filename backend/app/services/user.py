import logging

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User

logger = logging.getLogger(__name__)


class UserService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_by_supabase_id(self, supabase_user_id: str) -> User | None:
        result = await self.db.execute(
            select(User).where(User.supabase_user_id == supabase_user_id)
        )
        return result.scalar_one_or_none()

    async def create_user(
        self,
        supabase_user_id: str,
        email: str,
        display_name: str | None = None,
    ) -> User:
        user = User(
            supabase_user_id=supabase_user_id,
            email=email,
            display_name=display_name,
        )
        self.db.add(user)
        await self.db.commit()
        await self.db.refresh(user)
        logger.info(
            "User provisioned on demand",
            extra={"supabase_user_id": supabase_user_id, "email": email},
        )
        return user

    async def get_or_create_user(
        self,
        supabase_user_id: str,
        email: str,
        display_name: str | None = None,
    ) -> User:
        user = await self.get_by_supabase_id(supabase_user_id)
        if user is not None:
            return user
        return await self.create_user(supabase_user_id, email, display_name)
