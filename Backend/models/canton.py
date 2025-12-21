from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, func
from sqlalchemy.orm import relationship

from core.database import Base


class Canton(Base):
    __tablename__ = "cantons"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    province_id = Column(Integer, ForeignKey("provinces.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    province = relationship("Province", backref="cantons")

