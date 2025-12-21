from datetime import datetime
from pydantic import BaseModel, ConfigDict


class UserBase(BaseModel):
    company_id: int | None = None
    email: str
    username: str
    first_name: str | None = None
    last_name: str | None = None
    phone: str | None = None
    position: str | None = None


class UserCreate(UserBase):
    password: str


class UserUpdate(BaseModel):
    first_name: str | None = None
    last_name: str | None = None
    phone: str | None = None
    position: str | None = None
    username: str | None = None
    company_id: int | None = None
    is_company_admin: bool | None = None
    membership_status: str | None = None


class UserRead(BaseModel):
    id: int
    company_id: int | None = None
    email: str
    first_name: str
    last_name: str
    phone: str | None = None
    position: str | None = None
    username: str | None = None
    membership_status: str
    is_company_admin: bool
    is_active: bool
    created_at: datetime | None = None
    last_login_at: datetime | None = None

    model_config = ConfigDict(from_attributes=True)

