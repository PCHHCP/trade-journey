from datetime import datetime

from pydantic import BaseModel


class TradingAccountResponse(BaseModel):
    id: str
    user_id: str
    account_name: str
    account_number: str
    platform: str
    company: str | None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
