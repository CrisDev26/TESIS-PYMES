from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from core.database import get_db
from models.parish import Parish
from schemas.parish import ParishCreate, ParishRead


router = APIRouter()


@router.get("/", response_model=List[ParishRead])
def list_parishes(db: Session = Depends(get_db)):
    parishes = db.query(Parish).order_by(Parish.name).all()
    return parishes


@router.post("/", response_model=ParishRead, status_code=status.HTTP_201_CREATED)
def create_parish(payload: ParishCreate, db: Session = Depends(get_db)):
    existing = (
        db.query(Parish)
        .filter(Parish.name == payload.name, Parish.canton_id == payload.canton_id)
        .one_or_none()
    )
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Parish already exists for this canton",
        )
    parish = Parish(name=payload.name, canton_id=payload.canton_id)
    db.add(parish)
    db.commit()
    db.refresh(parish)
    return parish

