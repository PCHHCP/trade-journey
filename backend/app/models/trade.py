from datetime import datetime
from decimal import Decimal

from sqlalchemy import BigInteger, DateTime, Numeric, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base, TimestampMixin, generate_id


class Trade(Base, TimestampMixin):
    __tablename__ = "trades"
    __table_args__ = (UniqueConstraint("account_id", "ticket", name="uq_account_ticket"),)

    id: Mapped[str] = mapped_column(String, primary_key=True, default=generate_id)
    user_id: Mapped[str] = mapped_column(String, index=True)
    account_id: Mapped[str] = mapped_column(String, index=True)
    ticket: Mapped[int] = mapped_column(BigInteger)
    symbol: Mapped[str] = mapped_column(String)
    type: Mapped[str] = mapped_column(String)
    volume: Mapped[Decimal] = mapped_column(Numeric)
    open_price: Mapped[Decimal] = mapped_column(Numeric)
    stop_loss: Mapped[Decimal | None] = mapped_column(Numeric, nullable=True)
    take_profit: Mapped[Decimal | None] = mapped_column(Numeric, nullable=True)
    open_time: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    close_time: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    close_price: Mapped[Decimal] = mapped_column(Numeric)
    commission: Mapped[Decimal] = mapped_column(Numeric)
    swap: Mapped[Decimal] = mapped_column(Numeric)
    profit: Mapped[Decimal] = mapped_column(Numeric)
