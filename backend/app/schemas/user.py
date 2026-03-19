from datetime import datetime

from pydantic import BaseModel


class UserResponse(BaseModel):
    id: str
    supabase_user_id: str
    email: str
    display_name: str | None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
