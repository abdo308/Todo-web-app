from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta
from app.database import get_db
from app.models import User
from app.schemas import UserCreate, UserResponse, Token, MessageResponse, UserUpdate, ChangePasswordRequest
from app.auth import (
    get_password_hash, 
    authenticate_user, 
    create_access_token,
    get_user_by_username,
    get_user_by_email,
    get_current_active_user,
    ACCESS_TOKEN_EXPIRE_MINUTES,
    verify_password,
)

router = APIRouter(prefix="/auth",tags=["Authentication"])

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register_user(user: UserCreate, db: Session = Depends(get_db)):
    """Register a new user"""
    # Check if user already exists
    if get_user_by_username(db, user.username):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already registered"
        )
    
    if get_user_by_email(db, user.email):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create new user
    hashed_password = get_password_hash(user.password)
    db_user = User(
        email=user.email,
        username=user.username,
        hashed_password=hashed_password,
        firstname=user.firstname,
        lastname=user.lastname,
        contact=user.contact,
        position=user.position
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@router.post("/login", response_model=Token)
async def login_user(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    """Login user and return access token"""
    # Allow login by email or username
    email = form_data.username
    user = authenticate_user(db, email, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email/username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me", response_model=UserResponse)
async def read_users_me(current_user: User = Depends(get_current_active_user)):
    """Get current user information"""
    return current_user


@router.put("/me", response_model=UserResponse)
async def put_current_user(
    user_update: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Update (PUT) current user's allowed fields"""
    data = user_update.dict(exclude_unset=True)
    if not data:
        return current_user

    # Check uniqueness for email/username
    if "email" in data and data.get("email"):
        existing = get_user_by_email(db, data.get("email"))
        if existing and existing.id != current_user.id:
            raise HTTPException(status_code=400, detail="Email already registered")

    if "username" in data and data.get("username"):
        existing = get_user_by_username(db, data.get("username"))
        if existing and existing.id != current_user.id:
            raise HTTPException(status_code=400, detail="Username already registered")

    for key, value in data.items():
        setattr(current_user, key, value)

    db.add(current_user)
    db.commit()
    db.refresh(current_user)
    return current_user


@router.post("/change-password", response_model=MessageResponse)
async def change_password(
    payload: ChangePasswordRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Change current user's password after validating current password"""
    # verify current password
    if not verify_password(payload.current_password, current_user.hashed_password):
        raise HTTPException(status_code=400, detail="Current password is incorrect")

    # validate new password length
    if not payload.new_password or len(payload.new_password) < 6:
        raise HTTPException(status_code=400, detail="New password must be at least 6 characters")

    # update password
    current_user.hashed_password = get_password_hash(payload.new_password)
    db.add(current_user)
    db.commit()
    return {"message": "Password changed successfully"}