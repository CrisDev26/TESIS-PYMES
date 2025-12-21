from datetime import datetime
from pydantic import BaseModel, ConfigDict


class CantonBase(BaseModel):
    name: str
    province_id: int


class CantonCreate(CantonBase):
    pass


class CantonRead(CantonBase):
    id: int
    created_at: datetime | None = None

    model_config = ConfigDict(from_attributes=True)

