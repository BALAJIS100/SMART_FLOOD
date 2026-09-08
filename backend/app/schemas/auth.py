from pydantic import BaseModel, EmailStr
from typing import Optional

class LoginRequest(BaseModel):
    email: str
    password: str

class SignupRequest(BaseModel):
    email: str
    password: str
    full_name: str
    phone: Optional[str] = None
    role_id: Optional[int] = 5  # Default to Viewer if not specified

class OTPRequest(BaseModel):
    identifier: str  # Email or Phone number

class OTPVerifyRequest(BaseModel):
    identifier: str
    otp_code: str

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: str
    user_id: int
    user_name: str
    email: str

class UserResponse(BaseModel):
    id: int
    email: str
    full_name: str
    phone: Optional[str] = None
    role: str
    is_active: bool

    class Config:
        from_attributes = True