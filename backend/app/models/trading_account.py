from sqlalchemy import String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base, TimestampMixin, generate_id


class TradingAccount(Base, TimestampMixin):
    __tablename__ = "trading_accounts"
    __table_args__ = (UniqueConstraint("user_id", "account_number", name="uq_user_account_number"),)

    id: Mapped[str] = mapped_column(String, primary_key=True, default=generate_id)
    user_id: Mapped[str] = mapped_column(String, index=True)
    account_name: Mapped[str] = mapped_column(String)
    account_number: Mapped[str] = mapped_column(String)
    platform: Mapped[str] = mapped_column(String)
    company: Mapped[str | None] = mapped_column(String, nullable=True)
