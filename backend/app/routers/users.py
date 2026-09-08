from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.models.role import Role
from app.schemas.user import UserResponse, UserCreate, UserUpdate, RoleResponse
from app.auth.security import get_current_user, require_roles, get_password_hash
from app.services.audit_service import log_action

router = APIRouter(prefix="/users", tags=["Users"])

@router.get("/roles", response_model=List[RoleResponse])
def get_roles(db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    return db.query(Role).all()

@router.get("", response_model=List[UserResponse])
def get_users(
    db: Session = Depends(get_db),
    role_id: Optional[int] = None,
    search: Optional[str] = None,
    current_user = Depends(require_roles(["Admin", "Disaster Management Officer"]))
):
    query = db.query(User)
    if role_id:
        query = query.filter(User.role_id == role_id)
    if search:
        query = query.filter((User.full_name.ilike(f"%{search}%")) | (User.email.ilike(f"%{search}%")))
    return query.order_by(User.id.desc()).all()

@router.post("", response_model=UserResponse)
def create_user(
    payload: UserCreate,
    db: Session = Depends(get_db),
    current_user = Depends(require_roles(["Admin"]))
):
    existing = db.query(User).filter(User.email == payload.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="User with this email already exists")
    
    hashed_pwd = get_password_hash(payload.password)
    user = User(
        email=payload.email,
        hashed_password=hashed_pwd,
        full_name=payload.full_name,
        phone=payload.phone,
        role_id=payload.role_id,
        is_active=payload.is_active if payload.is_active is not None else True
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    
    log_action(db, user_name=current_user.full_name, action="CREATE", module="Users", record_id=user.id, details=f"Created user {user.email}", user_id=current_user.id)
    return user

@router.get("/{user_id}", response_model=UserResponse)
def get_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(require_roles(["Admin", "Disaster Management Officer"]))
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.put("/{user_id}", response_model=UserResponse)
def update_user(
    user_id: int,
    payload: UserUpdate,
    db: Session = Depends(get_db),
    current_user = Depends(require_roles(["Admin"]))
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    data = payload.dict(exclude_unset=True)
    if "password" in data and data["password"]:
        user.hashed_password = get_password_hash(data.pop("password"))
        
    for k, v in data.items():
        setattr(user, k, v)
        
    db.commit()
    db.refresh(user)
    log_action(db, user_name=current_user.full_name, action="UPDATE", module="Users", record_id=user.id, details=f"Updated user {user.email}", user_id=current_user.id)
    return user

@router.delete("/{user_id}")
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(require_roles(["Admin"]))
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot delete your own admin account")
    
    db.delete(user)
    db.commit()
    log_action(db, user_name=current_user.full_name, action="DELETE", module="Users", record_id=user_id, details=f"Deleted user {user.email}", user_id=current_user.id)
    return {"message": "User deleted successfully"}
