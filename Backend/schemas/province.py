from datetime import datetime
from pydantic import BaseModel, ConfigDict


class ProvinceBase(BaseModel):
    name: str
    country_id: int


class ProvinceCreate(ProvinceBase):
    pass


class ProvinceRead(ProvinceBase):
    id: int
    created_at: datetime | None = None

    model_config = ConfigDict(from_attributes=True)

