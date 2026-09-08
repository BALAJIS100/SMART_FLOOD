from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

class UserBase(BaseModel):
    email: str
    full_name: str
    phone: Optional[str] = None
    role_id: int
    is_active: Optional[bool] = True

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    email: Optional[str] = None
    full_name: Optional[str] = None
    phone: Optional[str] = None
    role_id: Optional[int] = None
    is_active: Optional[bool] = None
    password: Optional[str] = None

class RoleResponse(BaseModel):
    id: int
    name: str
    description: Optional[str] = None

    class Config:
        from_attributes = True

class UserResponse(UserBase):
    id: int
    created_at: datetime
    role: Optional[RoleResponse] = None

    class Config:
        from_attributes = True
