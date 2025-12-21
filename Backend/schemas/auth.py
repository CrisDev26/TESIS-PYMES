from pydantic import BaseModel, ConfigDict, EmailStr
from typing import Optional

from .user import UserRead


class LoginRequest(BaseModel):
    username: Optional[str] = None
    email: Optional[EmailStr] = None
    password: str


class LoginResponse(BaseModel):
    user: UserRead

    model_config = ConfigDict(from_attributes=True)
