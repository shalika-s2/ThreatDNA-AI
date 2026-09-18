from pydantic import BaseModel, EmailStr, ConfigDict
from datetime import datetime
from typing import Optional

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str
    role: Optional[str] = "analyst"

class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    username: str
    email: EmailStr
    role: str
    created_at: datetime

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut

class TokenData(BaseModel):
    user_id: Optional[str] = None
