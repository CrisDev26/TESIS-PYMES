from datetime import datetime
from pydantic import BaseModel, ConfigDict


class ParishBase(BaseModel):
    name: str
    canton_id: int


class ParishCreate(ParishBase):
    pass


class ParishRead(ParishBase):
    id: int
    created_at: datetime | None = None

    model_config = ConfigDict(from_attributes=True)

