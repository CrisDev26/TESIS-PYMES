from typing import List
from decimal import Decimal

from fastapi import APIRouter, Depends, status, HTTPException
from sqlalchemy.orm import Session

from core.database import get_db
from models.participation import Participation
from models.tender import Tender
from models.company import Company
from schemas.participation import ParticipationCreate, ParticipationRead, ParticipationWithPrediction
from services.prediction_service import predict_win_probability, calculate_contract_duration_days
from services.gpt_service import generate_recommendation


router = APIRouter()


@router.get("/", response_model=List[ParticipationRead])
def list_participations(db: Session = Depends(get_db)):
    participations = db.query(Participation).order_by(Participation.created_at.desc()).all()
    return participations


@router.post("/predict", response_model=dict, status_code=status.HTTP_200_OK)
def predict_without_saving(payload: dict):
    """
    Calcula probabilidad y recomendación SIN guardar en BD.
    Solo para demostración con datos mock del frontend.
    
    Payload esperado:
    {
        "tender_data": {
            "title": str,
            "description": str,
            "main_category": str,
            "budget_amount": float,
            "buyer_name": str,
            "eligibility_criteria": str,
            "number_of_tenderers": int,
            "tender_duration_days": int
        },
        "bid_amount": float,
        "contract_duration_days": int
    }
    """
    tender_data = payload.get("tender_data", {})
    bid_amount = payload.get("bid_amount", 0)
    contract_duration_days = payload.get("contract_duration_days", 365)
    
    # Calcular probabilidad con CatBoost
    try:
        win_probability = predict_win_probability(
            number_of_tenderers=tender_data.get("number_of_tenderers", 1),
            main_category=tender_data.get("main_category", "Servicios"),
            budget=tender_data.get("budget_amount", 100000.0),
            bid_amount=bid_amount,
            tender_duration_days=tender_data.get("tender_duration_days", 28),
            contract_duration_days=contract_duration_days,
            winner=0
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error en predicción CatBoost: {str(e)}")
    
    # Generar recomendación con GPT
    try:
        recommendation = generate_recommendation(
            tender_title=tender_data.get("title", "Sin título"),
            tender_description=tender_data.get("description", "Sin descripción"),
            main_category=tender_data.get("main_category", "Servicios"),
            budget_amount=tender_data.get("budget_amount", 100000.0),
            buyer_name=tender_data.get("buyer_name", "Entidad desconocida"),
            eligibility_criteria=tender_data.get("eligibility_criteria", "No especificado"),
            number_of_tenderers=tender_data.get("number_of_tenderers", 1),
            company_name="Mi Empresa PYME",  # Mock
            company_sector=None,
            company_size=None,
            bid_amount=bid_amount,
            predicted_probability=win_probability
        )
    except Exception as e:
        # Si falla GPT, usar recomendación simple
        from services.gpt_service import generate_quick_recommendation
        recommendation = generate_quick_recommendation(win_probability, tender_data.get("number_of_tenderers", 1))
        recommendation += f"\n\n*Nota: Error GPT: {str(e)}*"
    
    return {
        "predicted_win_probability": win_probability,
        "recommendation": recommendation,
        "bid_amount": bid_amount,
        "tender_title": tender_data.get("title", ""),
        "main_category": tender_data.get("main_category", "")
    }


@router.post("/", response_model=ParticipationWithPrediction, status_code=status.HTTP_201_CREATED)
def create_participation_with_prediction(payload: ParticipationCreate, db: Session = Depends(get_db)):
    """
    Crea una participación y calcula automáticamente:
    1. Probabilidad de ganar usando CatBoost
    2. Recomendación personalizada usando GPT-4
    """
    # Validar que el tender existe
    tender = db.query(Tender).filter(Tender.id == payload.tender_id).first()
    if not tender:
        raise HTTPException(status_code=404, detail=f"Tender {payload.tender_id} no encontrado")
    
    # TODO: Obtener company_id del usuario autenticado
    # Por ahora usamos company_id = 1 (mock)
    company_id = 1
    company = db.query(Company).filter(Company.id == company_id).first()
    if not company:
        raise HTTPException(status_code=404, detail=f"Company {company_id} no encontrada")
    
    # Calcular contract_duration_days
    contract_duration_days = 365  # Default 1 año
    if payload.contract_start_date and payload.contract_end_date:
        try:
            contract_duration_days = calculate_contract_duration_days(
                payload.contract_start_date,
                payload.contract_end_date
            )
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Error calculando duración del contrato: {str(e)}")
    
    # Calcular probabilidad con CatBoost
    try:
        win_probability = predict_win_probability(
            number_of_tenderers=tender.number_of_tenderers or 1,
            main_category=tender.main_category or 'Servicios',
            budget=float(tender.budget_amount) if tender.budget_amount else 100000.0,
            bid_amount=payload.bid_amount,
            tender_duration_days=tender.tender_duration_days or 28,
            contract_duration_days=contract_duration_days,
            winner=0
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error en predicción CatBoost: {str(e)}")
    
    # Generar recomendación con GPT
    try:
        recommendation = generate_recommendation(
            tender_title=tender.title or "Sin título",
            tender_description=tender.description or "Sin descripción",
            main_category=tender.main_category or "Servicios",
            budget_amount=float(tender.budget_amount) if tender.budget_amount else 100000.0,
            buyer_name=tender.buyer_name or "Entidad desconocida",
            eligibility_criteria=tender.eligibility_criteria or "No especificado",
            number_of_tenderers=tender.number_of_tenderers or 1,
            company_name=company.display_name or "Empresa",
            company_sector=company.sector,
            company_size=company.company_size,
            bid_amount=payload.bid_amount,
            predicted_probability=win_probability
        )
    except Exception as e:
        # Si falla GPT, usar recomendación simple
        from services.gpt_service import generate_quick_recommendation
        recommendation = generate_quick_recommendation(win_probability, tender.number_of_tenderers or 1)
        recommendation += f"\n\n*Nota: Recomendación simplificada. Error GPT: {str(e)}*"
    
    # Crear participación con predicción
    participation = Participation(
        tender_id=payload.tender_id,
        company_id=company_id,
        bid_amount=Decimal(str(payload.bid_amount)),
        bid_currency=payload.bid_currency,
        participation_status='submitted',
        predicted_win_prob=Decimal(str(round(win_probability, 4))),
        model_version='catboost_v1',
        recommendation_text=recommendation
    )
    
    db.add(participation)
    db.commit()
    db.refresh(participation)
    
    # Construir respuesta
    return ParticipationWithPrediction(
        id=participation.id,
        tender_id=participation.tender_id,
        company_id=participation.company_id,
        bid_amount=float(participation.bid_amount),
        bid_currency=participation.bid_currency,
        predicted_win_probability=float(participation.predicted_win_prob),
        recommendation=participation.recommendation_text,
        status=participation.participation_status,
        created_at=participation.created_at
    )


@router.get("/{participation_id}", response_model=ParticipationWithPrediction)
def get_participation_with_prediction(participation_id: int, db: Session = Depends(get_db)):
    """Obtiene una participación con su predicción y recomendación."""
    participation = db.query(Participation).filter(Participation.id == participation_id).first()
    if not participation:
        raise HTTPException(status_code=404, detail=f"Participation {participation_id} no encontrada")
    
    return ParticipationWithPrediction(
        id=participation.id,
        tender_id=participation.tender_id,
        company_id=participation.company_id,
        bid_amount=float(participation.bid_amount) if participation.bid_amount else 0.0,
        bid_currency=participation.bid_currency or 'USD',
        predicted_win_probability=float(participation.predicted_win_prob) if participation.predicted_win_prob else 0.0,
        recommendation=participation.recommendation_text or "Sin recomendación",
        status=participation.participation_status or 'unknown',
        created_at=participation.created_at
    )

