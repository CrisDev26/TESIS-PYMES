"""
Servicio de recomendaciones con OpenAI GPT.
Genera recomendaciones personalizadas basadas en el análisis de licitación y probabilidad de ganar.
"""
import os
from typing import Optional
from dotenv import load_dotenv

# Cargar variables de entorno
load_dotenv()

# Inicializar cliente OpenAI solo si la API key está disponible
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
client = None

if OPENAI_API_KEY:
    try:
        from openai import OpenAI
        client = OpenAI(api_key=OPENAI_API_KEY)
        print(f"✅ OpenAI client inicializado correctamente")
    except Exception as e:
        print(f"⚠️  Warning: No se pudo inicializar OpenAI client: {e}")
        client = None
else:
    print(f"⚠️  Warning: OPENAI_API_KEY no encontrada en variables de entorno")


def generate_recommendation(
    tender_title: str,
    tender_description: str,
    main_category: str,
    budget_amount: float,
    buyer_name: str,
    eligibility_criteria: str,
    number_of_tenderers: int,
    company_name: str,
    company_sector: Optional[str],
    company_size: Optional[str],
    bid_amount: float,
    predicted_probability: float
) -> str:
    """
    Genera una recomendación personalizada usando GPT-4 basada en los datos de la licitación,
    la empresa y la probabilidad de ganar.
    
    Args:
        tender_title: Título de la licitación
        tender_description: Descripción completa
        main_category: Categoría (Bienes, Obras, Servicios)
        budget_amount: Presupuesto total en USD
        buyer_name: Nombre de la entidad compradora
        eligibility_criteria: Criterios de elegibilidad
        number_of_tenderers: Número de participantes
        company_name: Nombre de la empresa que participa
        company_sector: Sector de la empresa (opcional)
        company_size: Tamaño de la empresa (opcional)
        bid_amount: Monto de la oferta presentada
        predicted_probability: Probabilidad de ganar calculada por CatBoost (0.0 a 1.0)
    
    Returns:
        str: Recomendación generada por GPT
    """
    # Formatear probabilidad como porcentaje
    probability_percent = predicted_probability * 100
    
    # Determinar nivel de competitividad
    if probability_percent >= 70:
        competitiveness = "ALTA (muy favorable)"
    elif probability_percent >= 50:
        competitiveness = "MEDIA-ALTA (favorable)"
    elif probability_percent >= 30:
        competitiveness = "MEDIA (competitiva)"
    else:
        competitiveness = "BAJA (muy competitiva)"
    
    # Calcular diferencia entre oferta y presupuesto
    price_difference_percent = ((budget_amount - bid_amount) / budget_amount) * 100
    
    # Construir prompt para GPT
    prompt = f"""Eres un experto consultor en contratación pública ecuatoriana. Analiza la siguiente licitación y proporciona una recomendación profesional y específica para la empresa participante.

**LICITACIÓN**
Título: {tender_title}
Descripción: {tender_description[:500]}...
Categoría: {main_category}
Presupuesto referencial: ${budget_amount:,.2f} USD
Entidad compradora: {buyer_name}
Criterios de elegibilidad: {eligibility_criteria}
Número de participantes: {number_of_tenderers}

**EMPRESA PARTICIPANTE**
Nombre: {company_name}
Sector: {company_sector or 'No especificado'}
Tamaño: {company_size or 'No especificado'}

**OFERTA PRESENTADA**
Monto ofertado: ${bid_amount:,.2f} USD
Diferencia con presupuesto: {price_difference_percent:+.1f}%

**ANÁLISIS PREDICTIVO (Modelo CatBoost)**
Probabilidad de ganar: {probability_percent:.1f}%
Nivel de competitividad: {competitiveness}

---

Proporciona una recomendación estructurada con los siguientes apartados:

1. **Análisis de Viabilidad**: Evalúa la alineación entre la licitación y el perfil de la empresa. ¿Es adecuada esta oportunidad?

2. **Análisis de la Oferta**: Comenta sobre el monto ofertado. ¿Es competitivo? ¿Tiene riesgo de ser descalificado o de no ser rentable?

3. **Fortalezas y Oportunidades**: Identifica aspectos favorables basados en la probabilidad calculada y las características de la licitación.

4. **Riesgos y Consideraciones**: Señala posibles obstáculos, competencia, criterios técnicos complejos o riesgos de ejecución.

5. **Recomendación Final**: Conclusión clara (Participar/Reconsiderar/No participar) con 2-3 acciones concretas.

Sé conciso (máximo 400 palabras), profesional y práctico. Usa datos específicos del análisis."""

    # Si no hay cliente OpenAI configurado, usar recomendación rápida
    if not client:
        return generate_quick_recommendation(predicted_probability, number_of_tenderers)
    
    try:
        # Llamar a la API de OpenAI
        response = client.chat.completions.create(
            model="gpt-4o-mini",  # Usar GPT-4o-mini (más barato, tier gratuito)
            messages=[
                {
                    "role": "system",
                    "content": "Eres un experto consultor en contratación pública ecuatoriana con amplia experiencia en SERCOP. Proporcionas análisis claros, profesionales y basados en datos."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            temperature=0.7,  # Balance entre creatividad y precisión
            max_tokens=800,   # Limitar respuesta a ~400 palabras
        )
        
        # Extraer recomendación
        recommendation = response.choices[0].message.content
        
        return recommendation
    
    except Exception as e:
        # En caso de error, devolver mensaje genérico basado en probabilidad
        if probability_percent >= 50:
            fallback = f"""**ANÁLISIS AUTOMÁTICO (API no disponible)**

**Probabilidad de Ganar: {probability_percent:.1f}%** - {competitiveness}

Su oferta de ${bid_amount:,.2f} USD presenta una probabilidad favorable de adjudicación. Con {number_of_tenderers} participantes, la competencia es {'moderada' if number_of_tenderers <= 5 else 'alta'}.

**Recomendación**: Considere participar. La probabilidad es favorable, pero revise cuidadosamente los criterios técnicos y asegure el cumplimiento de requisitos.

*Nota: Recomendación generada automáticamente. Error: {str(e)}*"""
        else:
            fallback = f"""**ANÁLISIS AUTOMÁTICO (API no disponible)**

**Probabilidad de Ganar: {probability_percent:.1f}%** - {competitiveness}

Su oferta de ${bid_amount:,.2f} USD presenta una probabilidad moderada-baja de adjudicación. Con {number_of_tenderers} participantes, la competencia es significativa.

**Recomendación**: Evalúe cuidadosamente si vale la pena el esfuerzo técnico y económico. Considere ajustar su estrategia de precios o enfocarse en licitaciones con mejor perfil de competitividad.

*Nota: Recomendación generada automáticamente. Error: {str(e)}*"""
        
        return fallback


def generate_quick_recommendation(predicted_probability: float, number_of_tenderers: int) -> str:
    """
    Genera una recomendación rápida y simple basada solo en probabilidad y competencia.
    Útil para vistas previas sin consumir tokens de OpenAI.
    
    Args:
        predicted_probability: Probabilidad de ganar (0.0 a 1.0)
        number_of_tenderers: Número de participantes
    
    Returns:
        str: Recomendación breve
    """
    probability_percent = predicted_probability * 100
    
    if probability_percent >= 70:
        return f"✅ **Alta probabilidad de ganar** ({probability_percent:.1f}%). Oportunidad excelente con {number_of_tenderers} competidores. Se recomienda participar."
    elif probability_percent >= 50:
        return f"✓ **Probabilidad favorable** ({probability_percent:.1f}%). Competencia moderada con {number_of_tenderers} participantes. Considere participar si cumple requisitos técnicos."
    elif probability_percent >= 30:
        return f"⚠ **Probabilidad media** ({probability_percent:.1f}%). Alta competencia con {number_of_tenderers} participantes. Evalúe cuidadosamente costos vs. beneficios."
    else:
        return f"❌ **Baja probabilidad** ({probability_percent:.1f}%). Muy competitiva con {number_of_tenderers} participantes. Considere otras oportunidades más viables."
