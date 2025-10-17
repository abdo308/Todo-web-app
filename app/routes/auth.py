from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta
from app.database import get_db 
from app.models import User
from app.schemas import TokenWithUser, UserCreate, UserResponse, Token, MessageResponse , UserBase , UserUpdate , ChangePasswordPayload
from app.auth import (
    get_password_hash, 
    authenticate_user, 
    create_access_token,
    get_user_by_username,
    get_user_by_email,
    get_current_active_user,
    _ensure_unique,
    get_current_user,
    verify_password,
    ACCESS_TOKEN_EXPIRE_MINUTES
)

router = APIRouter(tags=["Authentication"])

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
        firstname=user.firstname,
        lastname=user.lastname,
        contact=user.contact,
        hashed_password=hashed_password
    )
    
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    return db_user

@router.post("/login", response_model=Token)
async def login_user(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    """Login user and return access token"""
    user = authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer" }

@router.get("/me", response_model=UserResponse)
async def read_users_me(current_user: User = Depends(get_current_active_user)):
    """Get current user information"""
    return current_user

@router.patch("/update/{user_id}", response_model=UserResponse)
async def update_user( user_id: int, payload: UserUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    db_user = db.query(User).filter(User.id == user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found.")
    
    changes = payload.model_dump(exclude_unset=True)

    # Enforce uniqueness if changing email/username
    _ensure_unique(
        db,
        email=changes.get("email"),
        username=changes.get("username"),
        exclude_user_id=db_user.id,
    )
    # Apply changes
    for k, v in changes.items():
        setattr(db_user, k, v)

    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user



@router.post("/change-password", status_code=status.HTTP_200_OK)
def change_my_password(
    payload: ChangePasswordPayload,
    db: Session = Depends(get_db),
    me: User = Depends(get_current_user),
):
    if not payload.current_password:
        raise HTTPException(status_code=400, detail="current_password is required.")

    if payload.new_password != payload.confirm_new_password:
        raise HTTPException(status_code=400, detail="New passwords do not match.")

    if not verify_password(payload.current_password, me.hashed_password):
        raise HTTPException(status_code=400, detail="Current password is incorrect.")

    me.hashed_password = get_password_hash(payload.new_password)
    db.add(me)
    db.commit()
    

    return {"detail": "Password updated successfully."}
