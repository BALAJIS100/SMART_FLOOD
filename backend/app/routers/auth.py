import random
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.models.role import Role
from app.schemas.auth import LoginRequest, SignupRequest, OTPRequest, OTPVerifyRequest, Token
from app.auth.security import verify_password, get_password_hash, create_access_token, get_current_user
from app.services.audit_service import log_action
from app.services.email_service import send_otp_email

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/login", response_model=Token)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email).first()
    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is deactivated"
        )
    
    role_name = user.role.name if user.role else "Viewer"
    access_token = create_access_token(data={"sub": str(user.id), "role": role_name, "email": user.email})
    
    log_action(db, user_name=user.full_name, action="LOGIN", module="Auth", record_id=user.id, details=f"User {user.email} logged in via password", user_id=user.id)
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "role": role_name,
        "user_id": user.id,
        "user_name": user.full_name,
        "email": user.email
    }

@router.post("/signup", response_model=Token)
def signup(payload: SignupRequest, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == payload.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User account with this email already exists"
        )
    
    # Public signup is strictly reserved for Common Public / Viewer role
    role = db.query(Role).filter(Role.name == "Viewer").first()
    role_id = role.id if role else 5


    hashed_pwd = get_password_hash(payload.password)
    user = User(
        email=payload.email,
        hashed_password=hashed_pwd,
        full_name=payload.full_name,
        phone=payload.phone,
        role_id=role_id,
        is_active=True
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    role_name = user.role.name if user.role else "Viewer"
    access_token = create_access_token(data={"sub": str(user.id), "role": role_name, "email": user.email})
    
    log_action(db, user_name=user.full_name, action="SIGNUP", module="Auth", record_id=user.id, details=f"New user registered: {user.email} ({role_name})", user_id=user.id)

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "role": role_name,
        "user_id": user.id,
        "user_name": user.full_name,
        "email": user.email
    }

@router.post("/request-otp")
def request_otp(payload: OTPRequest, db: Session = Depends(get_db)):
    ident = payload.identifier.strip()
    user = db.query(User).filter((User.email == ident) | (User.phone == ident)).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Account not found. Official personnel must be registered by an Admin. Common public users please sign up and log in via Email & Password."
        )
        
    role_name = user.role.name if user.role else "Viewer"
    if role_name == "Viewer":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="OTP Instant Login is reserved for Official Rescuers & Operations Command. Common public users please log in using Email & Password."
        )
        
    otp = f"{random.randint(100000, 999999)}"
    user.otp_code = otp
    user.otp_expires_at = datetime.utcnow() + timedelta(minutes=5)
    db.commit()
    
    # Send actual email via Gmail SMTP if identifier is an email address
    target_email = user.email if "@" in user.email else (ident if "@" in ident else None)
    email_sent = False
    if target_email:
        email_sent = send_otp_email(target_email, otp)
    
    log_action(db, user_name=user.full_name, action="REQUEST_OTP", module="Auth", record_id=user.id, details=f"OTP requested for {ident} (Email sent: {email_sent})", user_id=user.id)
    
    return {
        "message": f"OTP sent successfully to {ident}",
        "email_delivered": email_sent,
        "expires_in_minutes": 5
    }



@router.post("/verify-otp", response_model=Token)
def verify_otp(payload: OTPVerifyRequest, db: Session = Depends(get_db)):
    ident = payload.identifier.strip()
    user = db.query(User).filter((User.email == ident) | (User.phone == ident)).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Account not found"
        )
        
    role_name = user.role.name if user.role else "Viewer"
    if role_name == "Viewer":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="OTP Instant Login is reserved for Official Rescuers & Operations Command. Common public users please log in using Email & Password."
        )

    if not user.otp_code or user.otp_code != payload.otp_code.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid OTP code. Please check and try again."
        )
        
    if user.otp_expires_at and datetime.utcnow() > user.otp_expires_at:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="OTP code has expired. Please request a new OTP."
        )

        
    # Clear OTP after successful verification
    user.otp_code = None
    user.otp_expires_at = None
    db.commit()
    
    role_name = user.role.name if user.role else "Viewer"
    access_token = create_access_token(data={"sub": str(user.id), "role": role_name, "email": user.email})
    
    log_action(db, user_name=user.full_name, action="VERIFY_OTP", module="Auth", record_id=user.id, details=f"User {user.email} logged in via OTP", user_id=user.id)
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "role": role_name,
        "user_id": user.id,
        "user_name": user.full_name,
        "email": user.email
    }

@router.get("/me")
def get_me(current_user: User = Depends(get_current_user)):
    role_name = current_user.role.name if current_user.role else "Viewer"
    return {
        "id": current_user.id,
        "email": current_user.email,
        "full_name": current_user.full_name,
        "phone": current_user.phone,
        "role": role_name,
        "is_active": current_user.is_active
    }
