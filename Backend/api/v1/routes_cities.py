from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from core.database import get_db
from models.city import City
from schemas.city import CityCreate, CityRead


router = APIRouter()


@router.get("/", response_model=List[CityRead])
def list_cities(db: Session = Depends(get_db)):
    cities = db.query(City).order_by(City.name).all()
    return cities


@router.post("/", response_model=CityRead, status_code=status.HTTP_201_CREATED)
def create_city(payload: CityCreate, db: Session = Depends(get_db)):
    existing = (
        db.query(City)
        .filter(City.name == payload.name, City.province_id == payload.province_id)
        .one_or_none()
    )
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="City already exists for this province",
        )
    city = City(name=payload.name, province_id=payload.province_id)
    db.add(city)
    db.commit()
    db.refresh(city)
    return city

