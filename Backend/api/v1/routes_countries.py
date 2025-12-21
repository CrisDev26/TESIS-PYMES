from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from core.database import get_db
from models.country import Country
from schemas.country import CountryCreate, CountryRead

router = APIRouter()


@router.get("/", response_model=List[CountryRead])
def list_countries(db: Session = Depends(get_db)):
    countries = db.query(Country).order_by(Country.name).all()
    return countries


@router.post("/", response_model=CountryRead, status_code=status.HTTP_201_CREATED)
def create_country(payload: CountryCreate, db: Session = Depends(get_db)):
    existing = db.query(Country).filter(Country.name == payload.name).one_or_none()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Country already exists",
        )
    country = Country(name=payload.name, iso_code=payload.iso_code)
    db.add(country)
    db.commit()
    db.refresh(country)
    return country
