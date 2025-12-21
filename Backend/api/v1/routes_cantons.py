from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from core.database import get_db
from models.canton import Canton
from schemas.canton import CantonCreate, CantonRead


router = APIRouter()


@router.get("/", response_model=List[CantonRead])
def list_cantons(db: Session = Depends(get_db)):
    cantons = db.query(Canton).order_by(Canton.name).all()
    return cantons


@router.post("/", response_model=CantonRead, status_code=status.HTTP_201_CREATED)
def create_canton(payload: CantonCreate, db: Session = Depends(get_db)):
    existing = (
        db.query(Canton)
        .filter(Canton.name == payload.name, Canton.province_id == payload.province_id)
        .one_or_none()
    )
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Canton already exists for this province",
        )
    canton = Canton(name=payload.name, province_id=payload.province_id)
    db.add(canton)
    db.commit()
    db.refresh(canton)
    return canton

