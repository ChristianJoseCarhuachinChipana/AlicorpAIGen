from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime
from enum import Enum


class UserRole(str, Enum):
    CREADOR = "creador"
    APROBADOR_A = "aprobador_a"
    APROBADOR_B = "aprobador_b"
    ADMIN = "admin"


class UserBase(BaseModel):
    email: EmailStr
    nombre: str


class UserCreate(UserBase):
    password: str
    role: UserRole = UserRole.CREADOR


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserResponse(UserBase):
    id: str
    role: str
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


class TokenData(BaseModel):
    user_id: Optional[str] = None
    email: Optional[str] = None
