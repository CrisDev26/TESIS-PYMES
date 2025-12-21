from sqlalchemy import Column, Integer, String, DateTime, Numeric, ForeignKey, func, Text
from sqlalchemy.orm import relationship

from core.database import Base


class Participation(Base):
    __tablename__ = "participations"

    id = Column(Integer, primary_key=True, index=True)
    tender_id = Column(Integer, ForeignKey("tenders.id"), nullable=False)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False)
    created_by_user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    
    # Información de la oferta
    bid_amount = Column(Numeric(18, 2), nullable=True)
    bid_currency = Column(String(3), nullable=True, default='USD')
    participation_status = Column(String(50), nullable=True)  # submitted, awarded, rejected, withdrawn
    
    # Predicción de IA
    predicted_win_prob = Column(Numeric(5, 4), nullable=True)  # Probabilidad de 0.0000 a 1.0000
    model_version = Column(String(50), nullable=True)
    recommendation_text = Column(Text, nullable=True)
    
    # Auditoría
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relaciones - especificamos foreign_keys para evitar ambigüedad
    tender = relationship("Tender", foreign_keys=[tender_id], backref="participations")
    company = relationship("Company", backref="participations")
    created_by_user = relationship("User", foreign_keys=[created_by_user_id], backref="created_participations")

