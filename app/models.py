from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    username = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    firstname = Column(String, nullable=True)
    lastname = Column(String, nullable=True)
    contact = Column(String, nullable=True)
    position = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    # Relationship with todos
    todos = relationship("Todo", back_populates="owner", cascade="all, delete-orphan")

class Todo(Base):
    __tablename__ = "todos"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(String, nullable=True)
    # Optional scheduled date for the task
    date = Column(DateTime(timezone=True), nullable=True)
    completed = Column(Boolean, default=False)
    priority = Column(String, default="medium")  # low, medium, high
    status = Column(String, default="in_progress")  # pending, in_progress, completed
    # Store the uploaded image filename (if any)
    image = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Foreign key to users table
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Relationship with user
    owner = relationship("User", back_populates="todos")