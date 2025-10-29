# TESIS-PYMES (PymeCore)

Monorepo con:
- `frontend/` Angular (PymeCore UI)
- `Backend/` API (planificado: Python/Flask para recomendación y XAI)

## Requisitos
- Node.js 18+ y npm
- Git
- (Opcional backend) Python 3.10+

## Frontend
Ubicación: `frontend/`

Desarrollo local:
1. Instalar dependencias: `npm install`
2. Ejecutar: `npm start` (o el script equivalente definido en package.json)
3. Abrir en el navegador la URL indicada por Angular/Dev server

## Backend (plan)
Ubicación: `Backend/`

- API Flask `/predict` para consumir modelos entrenados (Random Forest / Gradient Boosting)
- XAI con LIME para explicaciones locales
- CORS habilitado para `frontend`

## Estructura
```
Backend/
frontend/
```

## Notas
- PDF de referencia del TIC en la raíz: `Trabajo Integración Curricular-CORDOVA Y SANCHEZ vfinal.pdf`
- Ver carpeta `frontend/public/images` para assets gráficos.

## Licencia
Este repositorio es parte del trabajo académico. Verificar las condiciones de uso antes de distribuir.
