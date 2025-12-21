from datetime import datetime
from pydantic import BaseModel, ConfigDict


class CityBase(BaseModel):
    name: str
    province_id: int


class CityCreate(CityBase):
    pass


class CityRead(CityBase):
    id: int
    created_at: datetime | None = None

    model_config = ConfigDict(from_attributes=True)

