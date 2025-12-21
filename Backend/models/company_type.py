from sqlalchemy import Column, Integer, String, Text

from core.database import Base


class CompanyType(Base):
    __tablename__ = "company_types"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
