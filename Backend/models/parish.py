from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, func
from sqlalchemy.orm import relationship

from core.database import Base


class Parish(Base):
    __tablename__ = "parishes"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    canton_id = Column(Integer, ForeignKey("cantons.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    canton = relationship("Canton", backref="parishes")

