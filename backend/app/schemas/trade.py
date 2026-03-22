from datetime import datetime

from pydantic import BaseModel

from app.schemas.trading_account import TradingAccountResponse


class TradeResponse(BaseModel):
    id: str
    user_id: str
    account_id: str
    ticket: int
    symbol: str
    type: str
    volume: float
    open_price: float
    stop_loss: float | None
    take_profit: float | None
    open_time: datetime
    close_time: datetime
    close_price: float
    commission: float
    swap: float
    profit: float
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
