# Sistema de Recomendaciones Diarias con IA

Este sistema genera automáticamente 3 recomendaciones de licitaciones cada 24 horas basadas en el perfil de la empresa.

## 🚀 Características

- ✅ **Análisis inteligente** con GPT-4o-mini
- ✅ **Caché de 24 horas** para optimizar costos
- ✅ **Filtrado basado en reglas** + análisis GPT
- ✅ **Resumen corto y preciso** del por qué de las recomendaciones
- ✅ **Actualización automática** cada 24 horas

## 📋 Configuración

### 1. Backend

1. **Instalar dependencias:**
```bash
cd Backend
pip install openai
```

2. **Configurar API Key de OpenAI:**

Edita el archivo `.env` y agrega tu API key:
```env
OPENAI_API_KEY=sk-proj-tu-api-key-aqui
```

Puedes obtener tu API key en: https://platform.openai.com/api-keys

3. **Iniciar el servidor:**
```bash
python -m uvicorn app:app --reload --host 127.0.0.1 --port 8000
```

### 2. Frontend

El frontend ya está configurado para consumir el endpoint de recomendaciones.

Asegúrate de que el servidor backend esté corriendo en `http://127.0.0.1:8000`

## 🔧 Endpoints

### GET `/api/v1/recommendations/daily`

Obtiene las 3 mejores recomendaciones del día.

**Respuesta exitosa:**
```json
{
  "success": true,
  "data": {
    "has_recommendations": true,
    "summary": "Estas tres licitaciones destacan por su alta compatibilidad...",
    "tenders": [
      {
        "external_id": "ocds-123",
        "title": "Sistema de gestión...",
        "buyer_name": "Ministerio de X",
        "budget_amount": 50000,
        "main_category": "Servicios de TI",
        "number_of_tenderers": 2,
        "match_score": 85
      }
    ],
    "generated_at": "2026-01-01T10:00:00",
    "next_update": "2026-01-02T10:00:00"
  }
}
```

## 💰 Costos

- **Costo por recomendación:** ~$0.005 USD
- **Costo mensual estimado:** ~$0.15 USD (30 días)
- **Modelo usado:** GPT-4o-mini (más económico y rápido)

## 🎯 Cómo Funciona

1. **Filtrado inicial:** El sistema analiza todas las licitaciones abiertas con reglas de negocio:
   - Categoría compatible (tecnología, software, TI, etc.)
   - Presupuesto razonable ($10K - $150K)
   - Baja competencia (≤ 7 competidores)
   - Tiempo disponible (> 7 días)

2. **Selección de candidatas:** Se eligen las 3 mejores basadas en puntuación

3. **Análisis GPT:** GPT-4o-mini genera un resumen explicando por qué estas licitaciones son recomendables

4. **Caché:** Las recomendaciones se guardan por 24 horas para evitar llamadas duplicadas

## 🔄 Actualización Manual

Si necesitas forzar una nueva generación de recomendaciones antes de las 24 horas, elimina el archivo de caché:

```bash
rm Backend/data/daily_recommendations.json
```

## 📁 Estructura de Archivos

```
Backend/
├── services/
│   └── recommendation_service.py    # Motor de recomendaciones
├── api/v1/
│   └── routes_recommendations.py    # Endpoints API
├── data/
│   └── daily_recommendations.json   # Caché (se crea automáticamente)
└── app.py                           # Configuración principal

frontend/src/app/features/dashboard/
├── home.component.ts                # Lógica del componente
├── home.component.html              # Vista con sección de recomendaciones
└── home.component.css               # Estilos
```

## 🐛 Troubleshooting

### Error: "No module named 'openai'"
```bash
pip install openai
```

### Error: "Missing OPENAI_API_KEY"
Verifica que tu archivo `.env` tenga la key configurada.

### No se muestran recomendaciones
1. Verifica que el backend esté corriendo
2. Revisa la consola del navegador para ver errores
3. Verifica que haya licitaciones abiertas en la BD

### Las recomendaciones no se actualizan
El sistema actualiza cada 24 horas. Para forzar actualización, elimina el archivo de caché.

## 📝 Personalización

Para ajustar los criterios de recomendación, edita el método `_filter_top_candidates` en `recommendation_service.py`:

```python
# Ajustar rangos de presupuesto
if 20000 <= budget <= 100000:
    score += 30

# Ajustar peso de competencia
if competitors <= 3:
    score += 20
```

## 🎨 Personalizar el Perfil de Empresa

Edita el perfil en `recommendation_service.py`:

```python
self.company_profile = {
    'name': 'TechSolutions S.A.',
    'industry': 'Tecnología',
    'size': 'Pequeña empresa',
    'specialties': ['Desarrollo de software', 'Infraestructura TI'],
    'avg_budget': 50000,
    'experience_years': 5,
    'success_rate': 65
}
```

## ✨ Próximas Mejoras

- [ ] Perfil de empresa dinámico desde BD
- [ ] Análisis histórico de participaciones
- [ ] Filtros personalizados por usuario
- [ ] Notificaciones push de nuevas recomendaciones
- [ ] Dashboard de métricas de recomendaciones
