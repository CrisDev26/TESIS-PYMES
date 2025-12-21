from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, String, func
from sqlalchemy.orm import relationship

from core.database import Base
from datetime import datetime
from pydantic import BaseModel


class UserBase(BaseModel):
    company_id: int | None = None
    email: str
    first_name: str
    last_name: str
    phone: str | None = None
    position: str | None = None
    username: str | None = None  # NUEVO CAMPO


class UserCreate(UserBase):
    password: str


class UserRead(BaseModel):
    id: int
    company_id: int | None = None
    email: str
    first_name: str
    last_name: str
    phone: str | None = None
    position: str | None = None
    username: str | None = None  # NUEVO CAMPO
    membership_status: str
    is_company_admin: bool
    is_active: bool
    created_at: datetime | None = None
    last_login_at: datetime | None = None

    class Config:
        from_attributes = True


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=True)
    email = Column(String, nullable=False, unique=True)
    password_hash = Column(String, nullable=False)
    first_name = Column(String, nullable=False)
    last_name = Column(String, nullable=False)
    phone = Column(String, nullable=True)
    position = Column(String, nullable=True)
    username = Column(String, nullable=True, unique=True)  # NUEVO CAMPO
    membership_status = Column(String, nullable=False, server_default="pending")
    is_company_admin = Column(Boolean, nullable=False, server_default="false")
    is_active = Column(Boolean, nullable=False, server_default="true")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    last_login_at = Column(DateTime(timezone=True), nullable=True)

    company = relationship("Company")

