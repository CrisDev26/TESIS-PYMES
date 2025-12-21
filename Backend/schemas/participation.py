from datetime import datetime
from decimal import Decimal
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field


class ParticipationBase(BaseModel):
    tender_id: int
    company_id: int
    offered_amount: Decimal | None = None
    status: str | None = None


class ParticipationCreate(BaseModel):
    """Schema para crear una participación con predicción de probabilidad."""
    tender_id: int = Field(..., gt=0, description="ID de la licitación")
    bid_amount: float = Field(..., gt=0, description="Monto de la oferta en USD")
    bid_currency: str = Field(default="USD", description="Moneda de la oferta")
    contract_start_date: Optional[str] = Field(None, description="Fecha inicio contrato (ISO format)")
    contract_end_date: Optional[str] = Field(None, description="Fecha fin contrato (ISO format)")
    notes: Optional[str] = Field(None, max_length=1000, description="Notas adicionales")


class ParticipationWithPrediction(BaseModel):
    """Schema de respuesta con predicción y recomendación."""
    id: int
    tender_id: int
    company_id: int
    bid_amount: float
    bid_currency: str
    predicted_win_probability: float = Field(..., ge=0.0, le=1.0, description="Probabilidad de ganar (0-1)")
    recommendation: str = Field(..., description="Recomendación generada por GPT")
    status: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ParticipationRead(ParticipationBase):
    id: int
    created_at: datetime | None = None

    model_config = ConfigDict(from_attributes=True)

