"""
Servicio de predicción con CatBoost.
Calcula la probabilidad de ganar una licitación basado en características del tender y la oferta.
"""
from catboost import CatBoostClassifier
import os

# Ruta al modelo entrenado
MODEL_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'catboost_model.cbm')

# Cargar modelo una sola vez al importar el módulo
model = CatBoostClassifier()
model.load_model(MODEL_PATH)

# Mapeo de categorías a valores numéricos
CATEGORY_MAP = {
    'Bienes': 0,
    'Obras': 1,
    'Servicios': 2
}


def predict_win_probability(
    number_of_tenderers: int,
    main_category: str,
    budget: float,
    bid_amount: float,
    tender_duration_days: int,
    contract_duration_days: int,
    winner: int = 0
) -> float:
    """
    Predice la probabilidad de ganar una licitación.
    
    Args:
        number_of_tenderers: Número de participantes en la licitación
        main_category: Categoría principal ('Bienes', 'Obras', 'Servicios')
        budget: Presupuesto total de la licitación en USD
        bid_amount: Monto de la oferta presentada en USD
        tender_duration_days: Duración del proceso de licitación en días
        contract_duration_days: Duración del contrato en días
        winner: 0 (default) para predicción, 1 si ya ganó (para entrenamiento)
    
    Returns:
        float: Probabilidad de ganar (0.0 a 1.0)
    
    Raises:
        ValueError: Si la categoría no es válida o los valores son negativos
    """
    # Validaciones
    if main_category not in CATEGORY_MAP:
        raise ValueError(f"Categoría inválida: {main_category}. Debe ser 'Bienes', 'Obras' o 'Servicios'")
    
    if number_of_tenderers <= 0:
        raise ValueError("number_of_tenderers debe ser mayor a 0")
    
    if budget <= 0:
        raise ValueError("budget debe ser mayor a 0")
    
    if bid_amount <= 0:
        raise ValueError("bid_amount debe ser mayor a 0")
    
    if tender_duration_days <= 0:
        raise ValueError("tender_duration_days debe ser mayor a 0")
    
    if contract_duration_days <= 0:
        raise ValueError("contract_duration_days debe ser mayor a 0")
    
    # Convertir categoría a número
    main_category_encoded = CATEGORY_MAP[main_category]
    
    # Crear vector de características en el orden esperado por el modelo
    # [NumberOfTenderers, MainCategory, Budget, BidAmount, TenderDurationDays, ContractDurationDays, Winner]
    features = [
        number_of_tenderers,
        main_category_encoded,
        budget,
        bid_amount,
        tender_duration_days,
        contract_duration_days,
        winner
    ]
    
    # Predecir probabilidad (devuelve array con [prob_clase_0, prob_clase_1])
    probabilities = model.predict_proba([features])
    
    # Retornar probabilidad de la clase positiva (ganar)
    win_probability = probabilities[0][1]
    
    return float(win_probability)


def calculate_contract_duration_days(contract_start_date: str, contract_end_date: str) -> int:
    """
    Calcula la duración del contrato en días.
    
    Args:
        contract_start_date: Fecha de inicio en formato ISO (YYYY-MM-DD o con hora)
        contract_end_date: Fecha de fin en formato ISO (YYYY-MM-DD o con hora)
    
    Returns:
        int: Número de días de duración del contrato
    """
    from datetime import datetime
    
    # Parsear fechas (soporta formato con y sin hora)
    start = datetime.fromisoformat(contract_start_date.replace('Z', '+00:00'))
    end = datetime.fromisoformat(contract_end_date.replace('Z', '+00:00'))
    
    # Calcular diferencia en días
    duration = (end - start).days
    
    return max(duration, 1)  # Mínimo 1 día
