import logging

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.trade import Trade

logger = logging.getLogger(__name__)


class TradeService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def import_trades(
        self,
        user_id: str,
        account_id: str,
        trades_data: list[dict[str, object]],
    ) -> tuple[int, int]:
        """Import trades, skipping duplicates. Returns (imported, skipped)."""
        if not trades_data:
            return 0, 0

        tickets = [t["ticket"] for t in trades_data]
        result = await self.db.execute(
            select(Trade.ticket).where(
                Trade.account_id == account_id,
                Trade.ticket.in_(tickets),
            )
        )
        existing_tickets: set[int] = set(result.scalars().all())

        imported = 0
        skipped = 0
        for trade_data in trades_data:
            if trade_data["ticket"] in existing_tickets:
                skipped += 1
                continue

            trade = Trade(
                user_id=user_id,
                account_id=account_id,
                **trade_data,
            )
            self.db.add(trade)
            imported += 1

        if imported > 0:
            await self.db.commit()
            logger.info(
                "Trades imported",
                extra={"user_id": user_id, "account_id": account_id, "imported": imported},
            )

        return imported, skipped

    async def list_trades(
        self,
        user_id: str,
        account_id: str | None = None,
        limit: int = 50,
        offset: int = 0,
    ) -> tuple[list[Trade], int]:
        """List trades with pagination. Returns (trades, total_count)."""
        query = select(Trade).where(Trade.user_id == user_id)
        count_query = select(func.count()).select_from(Trade).where(Trade.user_id == user_id)

        if account_id is not None:
            query = query.where(Trade.account_id == account_id)
            count_query = count_query.where(Trade.account_id == account_id)

        query = query.order_by(Trade.close_time.desc()).limit(limit).offset(offset)

        result = await self.db.execute(query)
        trades = list(result.scalars().all())

        count_result = await self.db.execute(count_query)
        total = count_result.scalar_one()

        return trades, total
