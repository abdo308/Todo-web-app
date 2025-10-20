from fastapi import APIRouter, Depends, HTTPException, status, Query, UploadFile, File, Form
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
from typing import Optional, List
import os
import uuid
from datetime import datetime
from shutil import copyfileobj
from app.database import get_db
from app.models import User, Todo
from app.schemas import TodoCreate, TodoUpdate, TodoResponse, TodoList, MessageResponse, PriorityEnum
from app.auth import get_current_active_user
from app.cache import cache_result, invalidate_cache_pattern, rate_limit
import math

router = APIRouter(prefix="/todos", tags=["Todos"])

@router.post("", response_model=TodoResponse, status_code=status.HTTP_201_CREATED)
@rate_limit(max_requests=50, window=3600)  # 50 creates per hour
async def create_todo(
    title: str = Form(...),
    description: Optional[str] = Form(None),
    priority: PriorityEnum = Form(PriorityEnum.medium.value),
    date: Optional[str] = Form(None),
    image: Optional[UploadFile] = File(None),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Create a new todo (accepts multipart/form-data with optional image)"""

    # Parse date if provided (expecting ISO date or YYYY-MM-DD)
    parsed_date = None
    if date:
        try:
            parsed_date = datetime.fromisoformat(date)
        except Exception:
            try:
                parsed_date = datetime.strptime(date, "%Y-%m-%d")
            except Exception:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid date format. Use YYYY-MM-DD or ISO format.")

    image_filename = None
    if image:
        uploads_dir = os.path.join(os.getcwd(), "uploads")
        os.makedirs(uploads_dir, exist_ok=True)
        # generate unique filename keeping original extension
        _, ext = os.path.splitext(image.filename or "")
        image_filename = f"{uuid.uuid4().hex}{ext}"
        dest_path = os.path.join(uploads_dir, image_filename)
        try:
            with open(dest_path, "wb") as f:
                copyfileobj(image.file, f)
        finally:
            image.file.close()

    db_todo = Todo(
        title=title,
        description=description,
        priority=priority if isinstance(priority, str) else priority.value,
        date=parsed_date,
        image=image_filename,
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
    title: Optional[str] = Form(None),
    description: Optional[str] = Form(None),
    priority: Optional[str] = Form(None),
    date: Optional[str] = Form(None),
    image: Optional[UploadFile] = File(None),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Update a specific todo, including optional image upload"""
    todo = db.query(Todo).filter(
        and_(Todo.id == todo_id, Todo.owner_id == current_user.id)
    ).first()
    if not todo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Todo not found"
        )
    # Handle image upload if provided
    if image:
        uploads_dir = os.path.join(os.getcwd(), "uploads")
        os.makedirs(uploads_dir, exist_ok=True)
        _, ext = os.path.splitext(image.filename or "")
        image_filename = f"{uuid.uuid4().hex}{ext}"
        dest_path = os.path.join(uploads_dir, image_filename)
        try:
            with open(dest_path, "wb") as f:
                copyfileobj(image.file, f)
        finally:
            image.file.close()
        todo.image = image_filename
    # Only update fields that are present in the request
    if title is not None and title != "":
        todo.title = title
    if description is not None and description != "":
        todo.description = description
    if priority is not None and priority != "":
        if priority not in ["low", "medium", "high"]:
            raise HTTPException(status_code=400, detail="Invalid priority value")
        todo.priority = priority
    if date is not None and date != "":
        try:
            todo.date = datetime.fromisoformat(date)
        except Exception:
            try:
                todo.date = datetime.strptime(date, "%Y-%m-%d")
            except Exception:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid date format. Use YYYY-MM-DD or ISO format.")
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