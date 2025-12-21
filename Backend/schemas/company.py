from datetime import date, datetime
from pydantic import BaseModel, ConfigDict


class CompanyBase(BaseModel):
    legal_name: str
    tax_id: str
    country_id: int
    province_id: int
    city_id: int
    trade_name: str | None = None
    display_name: str | None = None
    incorporation_date: date | None = None
    email: str | None = None
    phone: str | None = None
    website: str | None = None
    address_line: str | None = None
    postal_code: str | None = None
    logo_url: str | None = None
    company_type_id: int | None = None
    sector_id: int | None = None
    company_size_id: int | None = None


class CompanyCreate(CompanyBase):
    pass


class CompanyRead(CompanyBase):
    id: int
    created_at: datetime | None = None

    model_config = ConfigDict(from_attributes=True)

