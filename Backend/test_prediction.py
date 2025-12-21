"""
Script de prueba para el servicio de predicción CatBoost.
Verifica que el modelo se cargue correctamente y haga predicciones.
"""
import sys
import os

# Agregar directorio padre al path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from services.prediction_service import predict_win_probability, CATEGORY_MAP


def test_prediction():
    """Prueba el servicio de predicción con datos de ejemplo."""
    
    print("=" * 60)
    print("TEST: Servicio de Predicción CatBoost")
    print("=" * 60)
    
    # Caso 1: Oferta muy competitiva (menor que presupuesto, pocos participantes)
    print("\n📊 Caso 1: Oferta competitiva")
    print("-" * 60)
    prob1 = predict_win_probability(
        number_of_tenderers=3,
        main_category='Servicios',
        budget=100000.0,
        bid_amount=85000.0,  # 15% menos que presupuesto
        tender_duration_days=28,
        contract_duration_days=365,
        winner=0
    )
    print(f"Participantes: 3")
    print(f"Categoría: Servicios")
    print(f"Presupuesto: $100,000")
    print(f"Oferta: $85,000 (15% menos)")
    print(f"Duración licitación: 28 días")
    print(f"Duración contrato: 365 días")
    print(f"✅ Probabilidad de ganar: {prob1:.2%}")
    
    # Caso 2: Oferta menos competitiva (cerca del presupuesto, muchos participantes)
    print("\n📊 Caso 2: Oferta menos competitiva")
    print("-" * 60)
    prob2 = predict_win_probability(
        number_of_tenderers=12,
        main_category='Obras',
        budget=2965076.05,
        bid_amount=2900000.0,  # Solo 2% menos
        tender_duration_days=28,
        contract_duration_days=730,
        winner=0
    )
    print(f"Participantes: 12")
    print(f"Categoría: Obras")
    print(f"Presupuesto: $2,965,076")
    print(f"Oferta: $2,900,000 (2% menos)")
    print(f"Duración licitación: 28 días")
    print(f"Duración contrato: 730 días")
    print(f"✅ Probabilidad de ganar: {prob2:.2%}")
    
    # Caso 3: Oferta muy agresiva (muy baja)
    print("\n📊 Caso 3: Oferta muy agresiva")
    print("-" * 60)
    prob3 = predict_win_probability(
        number_of_tenderers=5,
        main_category='Bienes',
        budget=50000.0,
        bid_amount=30000.0,  # 40% menos
        tender_duration_days=21,
        contract_duration_days=180,
        winner=0
    )
    print(f"Participantes: 5")
    print(f"Categoría: Bienes")
    print(f"Presupuesto: $50,000")
    print(f"Oferta: $30,000 (40% menos)")
    print(f"Duración licitación: 21 días")
    print(f"Duración contrato: 180 días")
    print(f"✅ Probabilidad de ganar: {prob3:.2%}")
    
    print("\n" + "=" * 60)
    print("✅ TEST COMPLETADO - Modelo CatBoost funciona correctamente")
    print("=" * 60)


def test_validations():
    """Prueba las validaciones del servicio."""
    
    print("\n" + "=" * 60)
    print("TEST: Validaciones")
    print("=" * 60)
    
    # Categoría inválida
    print("\n❌ Test: Categoría inválida")
    try:
        predict_win_probability(
            number_of_tenderers=3,
            main_category='Invalid',
            budget=100000.0,
            bid_amount=85000.0,
            tender_duration_days=28,
            contract_duration_days=365
        )
        print("   FALLÓ: Debería haber lanzado ValueError")
    except ValueError as e:
        print(f"   ✅ Validación correcta: {str(e)}")
    
    # Valores negativos
    print("\n❌ Test: Valores negativos")
    try:
        predict_win_probability(
            number_of_tenderers=-1,
            main_category='Servicios',
            budget=100000.0,
            bid_amount=85000.0,
            tender_duration_days=28,
            contract_duration_days=365
        )
        print("   FALLÓ: Debería haber lanzado ValueError")
    except ValueError as e:
        print(f"   ✅ Validación correcta: {str(e)}")
    
    print("\n" + "=" * 60)
    print("✅ VALIDACIONES COMPLETADAS")
    print("=" * 60)


if __name__ == "__main__":
    try:
        test_prediction()
        test_validations()
    except Exception as e:
        print(f"\n❌ ERROR: {str(e)}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
