from pydantic import BaseModel, EmailStr, validator
from datetime import datetime
from typing import Optional, List
from enum import Enum
import re

class PriorityEnum(str, Enum):
    low = "low"
    medium = "medium"
    high = "high"

# User Schemas
class UserBase(BaseModel):
    email: EmailStr
    username: str
    firstname: str
    lastname: str
    contact: str


class UserCreate(UserBase):
    password: str
    
    @validator('password')
    def validate_password(cls, v):
        if len(v) < 6:
            raise ValueError('Password must be at least 6 characters long')
        return v

class UserLogin(BaseModel):
    username: str
    password: str

class UserResponse(UserBase):
    id: int
    is_active: bool
    created_at: datetime
    contact:   str
    
    # class Config:
    #     from_attributes = True

# Todo Schemas
class TodoBase(BaseModel):
    title: str
    description: Optional[str] = None
    priority: PriorityEnum = PriorityEnum.medium

class TodoCreate(TodoBase):
    pass

class TodoUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    completed: Optional[bool] = None
    priority: Optional[PriorityEnum] = None

class TodoResponse(TodoBase):
    id: int
    completed: bool
    created_at: datetime
    updated_at: Optional[datetime] = None
    owner_id: int
    
    class Config:
        from_attributes = True

class TodoList(BaseModel):
    todos: List[TodoResponse]
    total: int
    page: int
    size: int
    pages: int

# Token Schemas
class Token(BaseModel):
    access_token: str
    token_type: str
    
class TokenWithUser(UserResponse):
    access_token: str
    token_type: str

    

class TokenData(BaseModel):
    username: Optional[str] = None

# Response Schemas
class MessageResponse(BaseModel):
    message: str
    
class UserUpdate(BaseModel):
    email: EmailStr
    firstname: str
    lastname: str
    contact: str 
    
    @validator('contact')
    def validate_contact(cls, v):
        RE_11_DIGITS = re.compile(r'^\d{11}$')
        if len(v) < 11 or RE_11_DIGITS.fullmatch(v) is None :
            raise ValueError('Enter valid contact')
        return v

class ChangePasswordPayload(BaseModel):
    current_password: str
    new_password: str
    confirm_new_password: str 