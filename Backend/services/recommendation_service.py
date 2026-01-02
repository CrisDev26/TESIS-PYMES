import os
from openai import OpenAI
from typing import List, Dict, Optional
from datetime import datetime, timedelta
import json

class SimpleRecommendationService:
    def __init__(self):
        self.client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))
        self.cache_file = 'data/daily_recommendations.json'
        
    def get_daily_recommendations(self, all_tenders: List[Dict]) -> Optional[Dict]:
        """
        Obtiene las 3 mejores recomendaciones del día con análisis corto
        """
        # Verificar caché (24 horas)
        cached = self._get_cache()
        if cached and self._is_valid_cache(cached):
            print("📌 Usando recomendación en caché")
            return cached
        
        # Generar nuevas recomendaciones
        print("🔄 Generando nuevas recomendaciones diarias...")
        recommendations = self._generate_recommendations(all_tenders)
        
        # Guardar en caché
        self._save_cache(recommendations)
        
        return recommendations
    
    def _generate_recommendations(self, tenders: List[Dict]) -> Dict:
        """Genera las 3 mejores recomendaciones con GPT"""
        
        # Filtrar las mejores candidatas
        top_tenders = self._filter_top_candidates(tenders, top_n=3)
        
        if len(top_tenders) < 3:
            return {
                'has_recommendations': False,
                'message': 'No hay suficientes licitaciones relevantes en este momento'
            }
        
        # Obtener resumen general con GPT
        summary = self._get_gpt_summary(top_tenders)
        
        return {
            'has_recommendations': True,
            'tenders': top_tenders,
            'summary': summary,
            'generated_at': datetime.now().isoformat(),
            'next_update': (datetime.now() + timedelta(hours=24)).isoformat()
        }
    
    def _filter_top_candidates(self, tenders: List[Dict], top_n: int = 3) -> List[Dict]:
        """Filtra y puntúa candidatos con reglas de negocio"""
        scored = []
        
        for tender in tenders:
            # Aceptar múltiples formatos de status: 'Abierta', 'active', 'abierta'
            status = tender.get('status', '').lower()
            if status not in ['abierta', 'active', 'open']:
                continue
            
            score = 0
            
            # Categoría tecnología
            category = tender.get('main_category', '').lower()
            if any(kw in category for kw in ['tecnolog', 'software', 'ti', 'informát', 'sistemas']):
                score += 40
            
            # Presupuesto razonable (20k - 100k)
            budget = tender.get('budget_amount', 0)
            if 20000 <= budget <= 100000:
                score += 30
            elif 10000 <= budget <= 150000:
                score += 15
            
            # Baja competencia
            competitors = tender.get('number_of_tenderers', 0)
            if competitors <= 3:
                score += 20
            elif competitors <= 7:
                score += 10
            
            # Tiempo disponible
            try:
                end_date = datetime.fromisoformat(tender.get('tender_end_date', '').replace('Z', '+00:00'))
                days = (end_date - datetime.now()).days
                if days > 15:
                    score += 10
            except:
                pass
            
            if score >= 50:
                scored.append({**tender, 'match_score': score})
        
        scored.sort(key=lambda x: x['match_score'], reverse=True)
        return scored[:top_n]
    
    def _get_gpt_summary(self, tenders: List[Dict]) -> str:
        """Genera resumen corto con GPT"""
        
        tenders_text = "\n\n".join([
            f"Licitación {i+1}:\n"
            f"- Título: {t.get('title', 'N/A')}\n"
            f"- Entidad: {t.get('buyer_name', 'N/A')}\n"
            f"- Presupuesto: ${t.get('budget_amount', 0):,.2f}\n"
            f"- Categoría: {t.get('main_category', 'N/A')}\n"
            f"- Competidores: {t.get('number_of_tenderers', 0)}"
            for i, t in enumerate(tenders)
        ])
        
        prompt = f"""
Eres un asesor de licitaciones. Analiza estas 3 licitaciones recomendadas para una empresa pequeña de tecnología:

{tenders_text}

Genera un resumen breve (máximo 3 líneas) explicando POR QUÉ estas licitaciones son las mejores opciones HOY.

Formato: Un solo párrafo, directo, profesional. NO usar bullets ni listas.

Ejemplo: "Estas tres licitaciones destacan por su alta compatibilidad con tu perfil tecnológico, presupuestos accesibles entre $40K-$80K y baja competencia (2-5 participantes), lo que incrementa significativamente tus probabilidades de éxito."
"""

        try:
            response = self.client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": "Eres un asesor experto. Respondes de forma concisa y profesional."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.7,
                max_tokens=200
            )
            
            return response.choices[0].message.content.strip()
            
        except Exception as e:
            print(f"Error GPT: {e}")
            return "Estas licitaciones fueron seleccionadas por su alta compatibilidad con tu perfil, presupuestos accesibles y bajo nivel de competencia actual."
    
    def _get_cache(self) -> Optional[Dict]:
        """Lee caché"""
        try:
            if not os.path.exists(self.cache_file):
                return None
            with open(self.cache_file, 'r', encoding='utf-8') as f:
                return json.load(f)
        except:
            return None
    
    def _is_valid_cache(self, cache: Dict) -> bool:
        """Valida caché (24h)"""
        try:
            cache_time = datetime.fromisoformat(cache['generated_at'])
            return (datetime.now() - cache_time) < timedelta(hours=24)
        except:
            return False
    
    def _save_cache(self, data: Dict):
        """Guarda en caché"""
        try:
            os.makedirs(os.path.dirname(self.cache_file), exist_ok=True)
            with open(self.cache_file, 'w', encoding='utf-8') as f:
                json.dump(data, f, ensure_ascii=False, indent=2)
            print(f"✅ Recomendaciones guardadas en caché hasta: {(datetime.now() + timedelta(hours=24)).strftime('%Y-%m-%d %H:%M')}")
        except Exception as e:
            print(f"Error guardando caché: {e}")
