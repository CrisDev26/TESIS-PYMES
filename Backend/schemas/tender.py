from pydantic import BaseModel, Field, ConfigDict
from typing import Optional
from datetime import datetime, date
from decimal import Decimal


# Schema para crear una nueva licitación
class TenderCreate(BaseModel):
    # Campos obligatorios
    external_id: str = Field(..., max_length=255, description="ID externo del sistema de contratación")
    title: str = Field(..., max_length=500, description="Título de la licitación")
    
    # Campos opcionales pero importantes
    ocid: Optional[str] = Field(None, max_length=255, description="Open Contracting ID")
    description: Optional[str] = Field(None, description="Descripción detallada")
    status: Optional[str] = Field("active", max_length=50, description="Estado: active, closed, awarded, cancelled")
    main_category: Optional[str] = Field(None, max_length=100, description="Categoría: Bienes, Servicios, Obras")
    
    # Información del comprador
    buyer_name: Optional[str] = Field(None, max_length=500)
    buyer_ruc: Optional[str] = Field(None, max_length=13, pattern=r"^\d{13}$")
    buyer_region: Optional[str] = Field(None, max_length=255)
    buyer_city: Optional[str] = Field(None, max_length=255)
    buyer_address: Optional[str] = Field(None)
    
    # Información presupuestaria
    budget_amount: Optional[Decimal] = Field(None, ge=0, description="Monto del presupuesto")
    budget_currency: Optional[str] = Field("USD", max_length=3, description="Moneda ISO 4217")
    estimated_value: Optional[Decimal] = Field(None, ge=0)
    
    # Fechas
    tender_start_date: Optional[date] = None
    tender_end_date: Optional[date] = None
    contract_start_date: Optional[date] = None
    contract_end_date: Optional[date] = None
    publish_date: Optional[datetime] = None
    
    # Información del proceso
    number_of_tenderers: Optional[int] = Field(None, ge=0)
    award_criteria: Optional[str] = Field(None)
    
    # Relaciones geográficas
    country_id: Optional[int] = None
    requirement_city_id: Optional[int] = None


# Schema para actualizar una licitación existente
class TenderUpdate(BaseModel):
    external_id: Optional[str] = Field(None, max_length=255)
    ocid: Optional[str] = Field(None, max_length=255)
    title: Optional[str] = Field(None, max_length=500)
    description: Optional[str] = None
    status: Optional[str] = Field(None, max_length=50)
    main_category: Optional[str] = Field(None, max_length=100)
    
    buyer_name: Optional[str] = Field(None, max_length=500)
    buyer_ruc: Optional[str] = Field(None, max_length=13, pattern=r"^\d{13}$")
    buyer_region: Optional[str] = Field(None, max_length=255)
    buyer_city: Optional[str] = Field(None, max_length=255)
    buyer_address: Optional[str] = None
    
    budget_amount: Optional[Decimal] = Field(None, ge=0)
    budget_currency: Optional[str] = Field(None, max_length=3)
    estimated_value: Optional[Decimal] = Field(None, ge=0)
    
    tender_start_date: Optional[date] = None
    tender_end_date: Optional[date] = None
    contract_start_date: Optional[date] = None
    contract_end_date: Optional[date] = None
    publish_date: Optional[datetime] = None
    
    number_of_tenderers: Optional[int] = Field(None, ge=0)
    award_criteria: Optional[str] = None
    
    country_id: Optional[int] = None
    requirement_city_id: Optional[int] = None
    
    # Información del ganador (solo para admin que publica)
    winning_company_id: Optional[int] = None
    winning_participation_id: Optional[int] = None


# Schema para respuesta de licitación (lectura)
class TenderRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    external_id: str
    ocid: Optional[str]
    title: str
    description: Optional[str]
    status: Optional[str]
    main_category: Optional[str]
    
    buyer_name: Optional[str]
    buyer_ruc: Optional[str]
    buyer_region: Optional[str]
    buyer_city: Optional[str]
    buyer_address: Optional[str]
    
    budget_amount: Optional[Decimal]
    budget_currency: Optional[str]
    estimated_value: Optional[Decimal]
    
    tender_start_date: Optional[date]
    tender_end_date: Optional[date]
    contract_start_date: Optional[date]
    contract_end_date: Optional[date]
    publish_date: Optional[datetime]
    
    number_of_tenderers: Optional[int]
    award_criteria: Optional[str]
    
    country_id: Optional[int]
    requirement_city_id: Optional[int]
    
    publishing_company_id: int
    created_by_user_id: int
    winning_company_id: Optional[int]
    winning_participation_id: Optional[int]
    
    created_at: datetime
    updated_at: Optional[datetime]


# Schema simplificado para listados
class TenderSummary(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    title: str
    status: Optional[str]
    main_category: Optional[str]
    buyer_name: Optional[str]
    budget_amount: Optional[Decimal]
    budget_currency: Optional[str]
    tender_start_date: Optional[date]
    tender_end_date: Optional[date]
    publishing_company_id: int
    created_at: datetime

