from sqlalchemy import Column, Integer, String, DateTime, Numeric, ForeignKey, func, Date, Text
from sqlalchemy.orm import relationship

from core.database import Base


class Tender(Base):
    __tablename__ = "tenders"

    # Campos principales
    id = Column(Integer, primary_key=True, index=True)
    external_id = Column(String(255), nullable=False, unique=True)  # ID externo del sistema de contratación
    ocid = Column(String(255), nullable=True)  # Open Contracting ID
    title = Column(String(500), nullable=False)
    description = Column(Text, nullable=True)
    
    # Estado y categorización
    status = Column(String(50), nullable=True)  # active, closed, awarded, cancelled
    main_category = Column(String(100), nullable=True)  # Bienes, Servicios, Obras
    
    # Información del comprador
    buyer_name = Column(String(500), nullable=True)
    buyer_ruc = Column(String(13), nullable=True)  # RUC ecuatoriano (13 dígitos)
    buyer_region = Column(String(255), nullable=True)
    buyer_city = Column(String(255), nullable=True)
    buyer_address = Column(Text, nullable=True)
    
    # Información presupuestaria
    budget_amount = Column(Numeric(18, 2), nullable=True)
    budget_currency = Column(String(3), nullable=True, default='USD')  # ISO 4217
    estimated_value = Column(Numeric(18, 2), nullable=True)
    
    # Fechas del proceso
    tender_start_date = Column(Date, nullable=True)
    tender_end_date = Column(Date, nullable=True)
    contract_start_date = Column(Date, nullable=True)
    contract_end_date = Column(Date, nullable=True)
    publish_date = Column(DateTime(timezone=True), nullable=True)
    
    # Información del proceso
    number_of_tenderers = Column(Integer, nullable=True)
    award_criteria = Column(Text, nullable=True)
    
    # Relaciones geográficas
    country_id = Column(Integer, ForeignKey("countries.id"), nullable=True)
    requirement_city_id = Column(Integer, ForeignKey("cities.id"), nullable=True)
    
    # Propiedad y autoría
    publishing_company_id = Column(Integer, ForeignKey("companies.id"), nullable=False)
    created_by_user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Información del ganador (cuando aplique)
    winning_company_id = Column(Integer, ForeignKey("companies.id"), nullable=True)
    winning_participation_id = Column(Integer, ForeignKey("participations.id"), nullable=True)
    
    # Auditoría
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relaciones
    country = relationship("Country", backref="tenders")
    requirement_city = relationship("City", foreign_keys=[requirement_city_id], backref="required_tenders")
    publishing_company = relationship("Company", foreign_keys=[publishing_company_id], backref="published_tenders")
    created_by_user = relationship("User", foreign_keys=[created_by_user_id], backref="created_tenders")
    winning_company = relationship("Company", foreign_keys=[winning_company_id], backref="won_tenders")
    winning_participation = relationship("Participation", foreign_keys=[winning_participation_id], post_update=True, backref="won_tender_record")

