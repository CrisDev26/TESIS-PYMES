from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.v1 import (
    routes_countries,
    routes_provinces,
    routes_cantons,
    routes_companies,
    routes_users,
    routes_tenders,
    routes_participations,
    routes_cities,
    routes_auth,
)


app = FastAPI(title="PYMES API", version="1.0.0", redirect_slashes=False)

# Configuración de CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:4200",
        "http://127.0.0.1:4200",
        "http://localhost:4200",  # Duplicado para asegurar
        "http://127.0.0.1:4200",
    ],
    allow_credentials=True,
    allow_methods=["*"],  # Permitir todos los métodos (GET, POST, PUT, DELETE, etc.)
    allow_headers=["*"],  # Permitir todos los headers
    expose_headers=["*"],  # Exponer todos los headers en la respuesta
    allow_origin_regex=r"http://(localhost|127\.0\.0\.1):4200",  # Regex para ambos
)


@app.get("/api/health", include_in_schema=False)
def health():
    return {"status": "ok"}


app.include_router(
    routes_countries.router,
    prefix="/api/v1/countries",
    tags=["countries"],
)
app.include_router(
    routes_provinces.router,
    prefix="/api/v1/provinces",
    tags=["provinces"],
)
app.include_router(
    routes_cities.router,
    prefix="/api/v1/cities",
    tags=["cities"],
)
app.include_router(
    routes_cantons.router,
    prefix="/api/v1/cantons",
    tags=["cantons"],
)
app.include_router(
    routes_companies.router,
    prefix="/api/v1/companies",
    tags=["companies"],
)
app.include_router(
    routes_users.router,
    prefix="/api/v1/users",
    tags=["users"],
)
app.include_router(
    routes_tenders.router,
    prefix="/api/v1/tenders",
    tags=["tenders"],
)
app.include_router(
    routes_participations.router,
    prefix="/api/v1/participations",
    tags=["participations"],
)
app.include_router(routes_auth.router)
