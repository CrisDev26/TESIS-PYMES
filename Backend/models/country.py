from sqlalchemy import Column, Integer, String, DateTime, func

from core.database import Base


class Country(Base):
    __tablename__ = "countries"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, unique=True)
    iso_code = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
