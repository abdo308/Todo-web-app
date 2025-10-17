from pydantic import BaseModel, EmailStr, validator
from datetime import datetime
from typing import Optional, List
from enum import Enum

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
    
class TokenWithUser(BaseModel, UserBase):
    access_token: str
    token_type: str

    

class TokenData(BaseModel):
    username: Optional[str] = None

# Response Schemas
class MessageResponse(BaseModel):
    message: str