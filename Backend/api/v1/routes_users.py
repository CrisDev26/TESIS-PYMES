from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from core.database import get_db
from models.user import User
from schemas.user import UserCreate, UserRead, UserUpdate


router = APIRouter()


@router.get("/", response_model=List[UserRead])
def list_users(db: Session = Depends(get_db)):
    users = db.query(User).order_by(User.created_at.desc().nullslast()).all()
    return users


@router.post("/", response_model=UserRead, status_code=status.HTTP_201_CREATED)
def create_user(payload: UserCreate, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == payload.email).one_or_none()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User with this email already exists",
        )

    user = User(
        company_id=payload.company_id,
        email=payload.email,
        password_hash=payload.password,  # sin hash real por ahora
        first_name=payload.first_name or "",
        last_name=payload.last_name or "",
        phone=payload.phone,
        position=payload.position,
        username=payload.username,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.get("/company/{company_id}/pending", response_model=List[UserRead])
def get_pending_users(company_id: int, db: Session = Depends(get_db)):
    """Obtener usuarios pendientes de aprobación para una empresa"""
    pending_users = db.query(User).filter(
        User.company_id == company_id,
        User.membership_status == "pending"
    ).all()
    return pending_users


@router.patch("/{user_id}/approve-membership", response_model=UserRead)
def approve_membership(
    user_id: int,
    approve: bool,
    db: Session = Depends(get_db)
):
    """Aprobar o rechazar la membresía de un usuario a una empresa"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
    
    if not user.company_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User is not associated with any company",
        )
    
    # Actualizar el estado de membresía
    user.membership_status = "approved" if approve else "rejected"
    
    db.commit()
    db.refresh(user)
    return user


@router.get("/{user_id}", response_model=UserRead)
def get_user(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
    return user


@router.patch("/{user_id}", response_model=UserRead)
def update_user(user_id: int, payload: UserUpdate, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
    
    # Actualizar solo los campos proporcionados
    if payload.first_name is not None:
        user.first_name = payload.first_name
    if payload.last_name is not None:
        user.last_name = payload.last_name
    if payload.phone is not None:
        user.phone = payload.phone
    if payload.position is not None:
        user.position = payload.position
    if payload.username is not None:
        user.username = payload.username
    if payload.company_id is not None:
        user.company_id = payload.company_id
    if payload.is_company_admin is not None:
        user.is_company_admin = payload.is_company_admin
    if payload.membership_status is not None:
        user.membership_status = payload.membership_status
    
    db.commit()
    db.refresh(user)
    return user

