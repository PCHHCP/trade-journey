import logging

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.trading_account import TradingAccount

logger = logging.getLogger(__name__)


class TradingAccountService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_or_create(
        self,
        user_id: str,
        account_name: str,
        account_number: str,
        platform: str,
        company: str | None,
    ) -> TradingAccount:
        result = await self.db.execute(
            select(TradingAccount).where(
                TradingAccount.user_id == user_id,
                TradingAccount.account_number == account_number,
            )
        )
        account = result.scalar_one_or_none()
        if account is not None:
            return account

        account = TradingAccount(
            user_id=user_id,
            account_name=account_name,
            account_number=account_number,
            platform=platform,
            company=company,
        )
        self.db.add(account)
        await self.db.commit()
        await self.db.refresh(account)
        logger.info(
            "Trading account created",
            extra={"user_id": user_id, "account_number": account_number},
        )
        return account

    async def list_by_user(self, user_id: str) -> list[TradingAccount]:
        result = await self.db.execute(
            select(TradingAccount).where(TradingAccount.user_id == user_id)
        )
        return list(result.scalars().all())
