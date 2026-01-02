from fastapi import APIRouter, HTTPException
from services.recommendation_service import SimpleRecommendationService
from typing import Optional
import json
import os

router = APIRouter()
recommendation_service = SimpleRecommendationService()


@router.get("/daily")
async def get_daily_recommendations():
    """
    Obtiene las 3 mejores recomendaciones del día con resumen corto.
    Se actualiza cada 24 horas automáticamente.
    """
    try:
        # Usar archivo mock_tenders.json
        mock_file = os.path.join(os.path.dirname(__file__), '..', '..', 'mock_tenders.json')
        print(f"📁 Buscando archivo en: {mock_file}")
        
        if not os.path.exists(mock_file):
            print(f"⚠️ Archivo no encontrado: {mock_file}")
            return {
                'success': True,
                'data': {
                    'has_recommendations': False,
                    'message': 'No hay licitaciones disponibles en este momento'
                }
            }
        
        with open(mock_file, 'r', encoding='utf-8') as f:
            data = json.load(f)
            # Extraer las licitaciones del JSON
            tenders_dict = data.get('tenders', []) if isinstance(data, dict) else data
        
        print(f"📊 Analizando {len(tenders_dict)} licitaciones para recomendaciones...")
        
        # Generar recomendaciones
        result = recommendation_service.get_daily_recommendations(tenders_dict)
        
        print(f"✅ Recomendaciones generadas: {result.get('has_recommendations', False)}")
        
        return {
            'success': True,
            'data': result
        }
    
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error generando recomendaciones: {str(e)}")
