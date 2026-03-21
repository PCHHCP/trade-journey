from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel

from app.schemas.trading_account import TradingAccountResponse


class TradeResponse(BaseModel):
    id: str
    user_id: str
    account_id: str
    ticket: int
    symbol: str
    type: str
    volume: Decimal
    open_price: Decimal
    stop_loss: Decimal | None
    take_profit: Decimal | None
    open_time: datetime
    close_time: datetime
    close_price: Decimal
    commission: Decimal
    swap: Decimal
    profit: Decimal
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class TradeListResponse(BaseModel):
    trades: list[TradeResponse]
    total: int


class ImportResult(BaseModel):
    imported: int
    skipped: int
    account: TradingAccountResponse
