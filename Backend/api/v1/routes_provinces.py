from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from core.database import get_db
from models.province import Province
from schemas.province import ProvinceCreate, ProvinceRead


router = APIRouter()


@router.get("/", response_model=List[ProvinceRead])
def list_provinces(db: Session = Depends(get_db)):
    provinces = db.query(Province).order_by(Province.name).all()
    return provinces


@router.post("/", response_model=ProvinceRead, status_code=status.HTTP_201_CREATED)
def create_province(payload: ProvinceCreate, db: Session = Depends(get_db)):
    existing = (
        db.query(Province)
        .filter(Province.name == payload.name, Province.country_id == payload.country_id)
        .one_or_none()
    )
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Province already exists for this country",
        )
    province = Province(name=payload.name, country_id=payload.country_id)
    db.add(province)
    db.commit()
    db.refresh(province)
    return province

