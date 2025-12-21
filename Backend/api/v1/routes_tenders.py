from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, status, Query, Header
from sqlalchemy.orm import Session
from sqlalchemy import not_, exists

from core.database import get_db
from models.tender import Tender
from models.participation import Participation
from models.user import User
from schemas.tender import TenderCreate, TenderRead, TenderUpdate, TenderSummary


router = APIRouter()


# Dependencia para obtener el usuario actual desde el header
def get_current_user_id(x_user_id: Optional[str] = Header(None)) -> int:
    if not x_user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="No se proporcionó ID de usuario. Por favor inicia sesión."
        )
    try:
        return int(x_user_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="ID de usuario inválido"
        )


def get_current_user(
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user_id)
) -> User:
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    if not user.company_id:
        raise HTTPException(status_code=400, detail="Usuario no pertenece a ninguna empresa")
    return user


@router.post("/", response_model=TenderRead, status_code=status.HTTP_201_CREATED)
def create_tender(
    tender_data: TenderCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Crear una nueva licitación.
    Todos los usuarios de la empresa pueden publicar licitaciones.
    """
    # Verificar que el external_id sea único
    existing = db.query(Tender).filter(Tender.external_id == tender_data.external_id).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Ya existe una licitación con external_id: {tender_data.external_id}"
        )
    
    # Crear la licitación con la empresa y usuario actual
    tender = Tender(
        **tender_data.model_dump(),
        publishing_company_id=current_user.company_id,
        created_by_user_id=current_user.id
    )
    
    db.add(tender)
    db.commit()
    db.refresh(tender)
    
    return tender


@router.get("/", response_model=List[TenderSummary])
def list_tenders(
    exclude_participated: bool = Query(False, description="Excluir licitaciones donde la empresa ya participó"),
    status_filter: Optional[str] = Query(None, description="Filtrar por estado"),
    category_filter: Optional[str] = Query(None, description="Filtrar por categoría"),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Listar licitaciones disponibles.
    Si exclude_participated=true, excluye licitaciones donde la empresa del usuario ya participó.
    """
    query = db.query(Tender)
    
    # Excluir licitaciones donde ya participamos
    if exclude_participated:
        participated_subquery = (
            db.query(Participation.tender_id)
            .filter(Participation.company_id == current_user.company_id)
            .subquery()
        )
        query = query.filter(not_(Tender.id.in_(participated_subquery)))
    
    # Filtros opcionales
    if status_filter:
        query = query.filter(Tender.status == status_filter)
    
    if category_filter:
        query = query.filter(Tender.main_category == category_filter)
    
    # Ordenar por fecha de creación (más recientes primero)
    query = query.order_by(Tender.created_at.desc())
    
    tenders = query.offset(skip).limit(limit).all()
    
    return tenders


@router.get("/my-company", response_model=List[TenderRead])
def list_my_company_tenders(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Listar licitaciones publicadas por la empresa del usuario actual.
    """
    tenders = (
        db.query(Tender)
        .filter(Tender.publishing_company_id == current_user.company_id)
        .order_by(Tender.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )
    
    return tenders


@router.get("/{tender_id}", response_model=TenderRead)
def get_tender(
    tender_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Obtener detalles de una licitación específica.
    """
    tender = db.query(Tender).filter(Tender.id == tender_id).first()
    
    if not tender:
        raise HTTPException(status_code=404, detail="Licitación no encontrada")
    
    return tender


@router.put("/{tender_id}", response_model=TenderRead)
def update_tender(
    tender_id: int,
    tender_data: TenderUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Actualizar una licitación existente.
    Solo usuarios de la empresa que publicó la licitación pueden editarla.
    """
    tender = db.query(Tender).filter(Tender.id == tender_id).first()
    
    if not tender:
        raise HTTPException(status_code=404, detail="Licitación no encontrada")
    
    # Verificar que el usuario pertenezca a la empresa que publicó
    if tender.publishing_company_id != current_user.company_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permisos para editar esta licitación"
        )
    
    # Actualizar solo los campos proporcionados
    update_data = tender_data.model_dump(exclude_unset=True)
    
    # Si se intenta cambiar el external_id, verificar unicidad
    if "external_id" in update_data and update_data["external_id"] != tender.external_id:
        existing = db.query(Tender).filter(
            Tender.external_id == update_data["external_id"]
        ).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Ya existe una licitación con external_id: {update_data['external_id']}"
            )
    
    for field, value in update_data.items():
        setattr(tender, field, value)
    
    db.commit()
    db.refresh(tender)
    
    return tender


@router.delete("/{tender_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_tender(
    tender_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Eliminar una licitación.
    Solo usuarios de la empresa que publicó la licitación pueden eliminarla.
    """
    tender = db.query(Tender).filter(Tender.id == tender_id).first()
    
    if not tender:
        raise HTTPException(status_code=404, detail="Licitación no encontrada")
    
    # Verificar que el usuario pertenezca a la empresa que publicó
    if tender.publishing_company_id != current_user.company_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permisos para eliminar esta licitación"
        )
    
    # Verificar si hay participaciones activas
    has_participations = db.query(exists().where(Participation.tender_id == tender_id)).scalar()
    if has_participations:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No se puede eliminar una licitación con participaciones activas"
        )
    
    db.delete(tender)
    db.commit()
    
    return None

