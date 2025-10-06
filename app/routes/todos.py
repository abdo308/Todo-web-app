from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
from typing import Optional, List
from app.database import get_db
from app.models import User, Todo
from app.schemas import TodoCreate, TodoUpdate, TodoResponse, TodoList, MessageResponse
from app.auth import get_current_active_user
from app.cache import cache_result, invalidate_cache_pattern, rate_limit
import math

router = APIRouter(prefix="/todos", tags=["Todos"])

@router.post("", response_model=TodoResponse, status_code=status.HTTP_201_CREATED)
@rate_limit(max_requests=50, window=3600)  # 50 creates per hour
async def create_todo(
    todo: TodoCreate, 
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Create a new todo"""
    db_todo = Todo(
        title=todo.title,
        description=todo.description,
        owner_id=current_user.id
    )
    
    db.add(db_todo)
    db.commit()
    db.refresh(db_todo)
    
    # Invalidate user's todos cache
    invalidate_cache_pattern(f"todos:get_todos:*{current_user.id}*")
    
    return db_todo

@router.get("", response_model=TodoList)
@cache_result(ttl=60, key_prefix="todos")  # Cache for 1 minute
@rate_limit(max_requests=200, window=3600)  # 200 requests per hour
async def get_todos(
    page: int = Query(1, ge=1, description="Page number"),
    size: int = Query(10, ge=1, le=100, description="Items per page"),
    completed: Optional[bool] = Query(None, description="Filter by completion status"),
    priority: Optional[str] = Query(None, description="Filter by priority"),
    search: Optional[str] = Query(None, description="Search in title and description"),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get user's todos with pagination and filters"""
    query = db.query(Todo).filter(Todo.owner_id == current_user.id)
    
    # Apply filters
    if completed is not None:
        query = query.filter(Todo.completed == completed)
    
    if priority:
        query = query.filter(Todo.priority == priority)
    
    if search:
        search_pattern = f"%{search}%"
        query = query.filter(
            or_(
                Todo.title.ilike(search_pattern),
                Todo.description.ilike(search_pattern)
            )
        )
    
    # Count total items
    total = query.count()
    
    # Apply pagination
    offset = (page - 1) * size
    todos = query.offset(offset).limit(size).all()
    
    # Calculate pagination info
    pages = math.ceil(total / size)
    
    return TodoList(
        todos=todos,
        total=total,
        page=page,
        size=size,
        pages=pages
    )

@router.get("/{todo_id}", response_model=TodoResponse)
async def get_todo(
    todo_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get a specific todo by ID"""
    todo = db.query(Todo).filter(
        and_(Todo.id == todo_id, Todo.owner_id == current_user.id)
    ).first()
    
    if not todo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Todo not found"
        )
    
    return todo

@router.put("/{todo_id}", response_model=TodoResponse)
async def update_todo(
    todo_id: int,
    todo_update: TodoUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Update a specific todo"""
    todo = db.query(Todo).filter(
        and_(Todo.id == todo_id, Todo.owner_id == current_user.id)
    ).first()
    
    if not todo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Todo not found"
        )
    
    # Update only provided fields
    update_data = todo_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(todo, field, value)
    
    db.commit()
    db.refresh(todo)
    
    return todo

@router.delete("/{todo_id}", response_model=MessageResponse)
async def delete_todo(
    todo_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Delete a specific todo"""
    todo = db.query(Todo).filter(
        and_(Todo.id == todo_id, Todo.owner_id == current_user.id)
    ).first()
    
    if not todo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Todo not found"
        )
    
    db.delete(todo)
    db.commit()
    
    return MessageResponse(message="Todo deleted successfully")

@router.patch("/{todo_id}/toggle", response_model=TodoResponse)
async def toggle_todo_completion(
    todo_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Toggle todo completion status"""
    todo = db.query(Todo).filter(
        and_(Todo.id == todo_id, Todo.owner_id == current_user.id)
    ).first()
    
    if not todo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Todo not found"
        )
    
    todo.completed = not todo.completed
    db.commit()
    db.refresh(todo)
    
    return todo

@router.get("/stats")
async def get_todo_stats(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get todo statistics for current user"""
    total_todos = db.query(Todo).filter(Todo.owner_id == current_user.id).count()
    completed_todos = db.query(Todo).filter(
        and_(Todo.owner_id == current_user.id, Todo.completed == True)
    ).count()
    pending_todos = total_todos - completed_todos
    
    return {
        "total_todos": total_todos,
        "completed_todos": completed_todos,
        "pending_todos": pending_todos,
        "completion_rate": round((completed_todos / total_todos * 100), 2) if total_todos > 0 else 0
    }