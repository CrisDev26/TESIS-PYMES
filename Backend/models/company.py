from sqlalchemy import Column, Integer, String, Date, DateTime, ForeignKey, func
from sqlalchemy.orm import relationship

from core.database import Base


class Company(Base):
    __tablename__ = "companies"

    id = Column(Integer, primary_key=True, index=True)
    legal_name = Column(String, nullable=False)
    trade_name = Column(String, nullable=True)
    display_name = Column(String, nullable=True)
    tax_id = Column(String, nullable=False, unique=True)
    incorporation_date = Column(Date, nullable=True)
    email = Column(String, nullable=True)
    phone = Column(String, nullable=True)
    website = Column(String, nullable=True)
    country_id = Column(Integer, ForeignKey("countries.id"), nullable=False)
    province_id = Column(Integer, ForeignKey("provinces.id"), nullable=False)
    city_id = Column(Integer, ForeignKey("cities.id"), nullable=False)
    address_line = Column(String, nullable=True)
    postal_code = Column(String, nullable=True)
    logo_url = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    company_type_id = Column(Integer, ForeignKey("company_types.id"), nullable=True)
    sector_id = Column(Integer, ForeignKey("sectors.id"), nullable=True)
    company_size_id = Column(Integer, ForeignKey("company_sizes.id"), nullable=True)

    country = relationship("Country")
    province = relationship("Province")
    city = relationship("City")

