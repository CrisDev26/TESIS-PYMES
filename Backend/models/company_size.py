from sqlalchemy import Column, Integer, String, Numeric

from core.database import Base


class CompanySize(Base):
    __tablename__ = "company_sizes"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), nullable=False)
    min_employees = Column(Integer, nullable=True)
    max_employees = Column(Integer, nullable=True)
    min_revenue = Column(Numeric, nullable=True)
    max_revenue = Column(Numeric, nullable=True)
