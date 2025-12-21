from datetime import datetime
from pydantic import BaseModel, ConfigDict


class CountryBase(BaseModel):
    name: str
    iso_code: str | None = None


class CountryCreate(CountryBase):
    pass


class CountryRead(CountryBase):
    id: int
    created_at: datetime | None = None

    model_config = ConfigDict(from_attributes=True)
