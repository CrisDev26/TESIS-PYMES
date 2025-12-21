from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from core.database import get_db
from models.company import Company
from schemas.company import CompanyCreate, CompanyRead


router = APIRouter()


@router.get("/", response_model=List[CompanyRead])
def list_companies(db: Session = Depends(get_db)):
    companies = db.query(Company).order_by(Company.legal_name).all()
    return companies


@router.post("/", response_model=CompanyRead, status_code=status.HTTP_201_CREATED)
def create_company(payload: CompanyCreate, db: Session = Depends(get_db)):
    existing = db.query(Company).filter(Company.tax_id == payload.tax_id).one_or_none()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Company with this tax_id already exists",
        )
    company = Company(
        legal_name=payload.legal_name,
        trade_name=payload.trade_name,
        display_name=payload.display_name,
        tax_id=payload.tax_id,
        incorporation_date=payload.incorporation_date,
        email=payload.email,
        phone=payload.phone,
        website=payload.website,
        country_id=payload.country_id,
        province_id=payload.province_id,
        city_id=payload.city_id,
        address_line=payload.address_line,
        postal_code=payload.postal_code,
        logo_url=payload.logo_url,
        company_type_id=payload.company_type_id,
        sector_id=payload.sector_id,
        company_size_id=payload.company_size_id,
    )
    db.add(company)
    db.commit()
    db.refresh(company)
    return company

