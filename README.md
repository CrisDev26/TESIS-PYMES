# 🏢 TESIS-PYMES (PymeCore)

Sistema integral de gestión y participación en licitaciones públicas para PYMEs, con predicción de probabilidad de adjudicación mediante Machine Learning.

---

## 📐 Arquitectura del Proyecto

### Patrón: **Monorepo con Backend-Frontend Separados**

```
TESIS-PYMES/
│
├── Backend/              # API REST (FastAPI + PostgreSQL)
│   ├── api/             # Endpoints REST organizados por recursos
│   ├── core/            # Configuración central y conexión DB
│   ├── models/          # Modelos de datos (SQLAlchemy ORM)
│   ├── schemas/         # Validación de datos (Pydantic)
│   └── services/        # Lógica de negocio (predicciones ML, etc.)
│
├── frontend/            # SPA (Angular + TypeScript)
│   └── src/
│       ├── app/
│       │   ├── features/      # Módulos funcionales por dominio
│       │   │   ├── auth/      # Autenticación y gestión de usuarios
│       │   │   ├── account/   # Perfil de empresa
│       │   │   ├── dashboard/ # Inicio/licitaciones
│       │   │   └── tenders/   # Publicación de licitaciones
│       │   ├── layout/        # Componentes de estructura (navbar, sidebar)
│       │   ├── services/      # Servicios HTTP (API clients)
│       │   ├── interceptors/  # HTTP interceptors (auth headers)
│       │   └── shared/        # Componentes/utilidades reutilizables
│       └── assets/            # Recursos estáticos
│
└── .vscode/             # Tareas automatizadas de VS Code
```

### ¿Por qué esta arquitectura?

#### **1. Separación Frontend-Backend (API-First)**
- ✅ **Escalabilidad**: Backend puede servir a múltiples clientes (web, mobile, desktop)
- ✅ **Desarrollo paralelo**: Equipos pueden trabajar independientemente
- ✅ **Seguridad**: Lógica de negocio y datos en el backend, UI en el frontend
- ✅ **Testing**: Cada capa se prueba por separado

#### **2. Backend: FastAPI + PostgreSQL**
- ✅ **FastAPI**: Framework moderno, async, auto-documentación (OpenAPI/Swagger)
- ✅ **SQLAlchemy**: ORM robusto para operaciones complejas de base de datos
- ✅ **Pydantic**: Validación automática de datos con type hints
- ✅ **PostgreSQL**: Base de datos relacional robusta para datos estructurados

#### **3. Frontend: Angular Standalone Components**
- ✅ **Angular 19**: Framework empresarial con DI, RxJS, TypeScript
- ✅ **Standalone Components**: Menos boilerplate, más modular
- ✅ **Reactive Forms**: Validación robusta del lado del cliente
- ✅ **HTTP Interceptors**: Manejo centralizado de autenticación

---

## 🔧 Dependencias y su Propósito

### Backend (Python 3.11.9)

#### **Core Framework**
```
fastapi==0.115.0           # Framework web async con auto-documentación
uvicorn==0.30.6            # Servidor ASGI de alto rendimiento
```
**¿Por qué?**: FastAPI combina velocidad (comparable a Node.js) con validación automática y documentación interactiva.

#### **Validación y Configuración**
```
pydantic==2.9.2            # Validación de datos con type hints
pydantic-settings==2.12.0  # Gestión de configuración (.env)
python-dotenv==1.0.1       # Carga variables de entorno
```
**¿Por qué?**: Pydantic garantiza que los datos sean válidos antes de procesarlos, evitando errores silenciosos.

#### **Base de Datos**
```
sqlalchemy==2.0.44         # ORM para mapeo objeto-relacional
psycopg2-binary==2.9.11    # Driver PostgreSQL
```
**¿Por qué?**: SQLAlchemy permite trabajar con objetos Python en lugar de SQL crudo, mejorando mantenibilidad y seguridad (previene SQL injection).

#### **Machine Learning (Opcional)**
```
pandas==2.2.3              # Manipulación de datos tabulares
catboost==1.2.5            # Modelo de clasificación (predicción de adjudicaciones)
```
**¿Por qué?**: CatBoost maneja bien datos categóricos (tipo de licitación, categoría) sin encoding manual y tiene mejor rendimiento con pocos datos.

---

### Frontend (Angular 19.2.13)

#### **Core Framework**
```json
"@angular/core": "^19.2.0"              // Framework base
"@angular/router": "^19.2.0"            // Navegación SPA
"@angular/forms": "^19.2.0"             // Formularios reactivos
"@angular/common": "^19.2.0"            // Pipes, directivas comunes
```
**¿Por qué?**: Angular proporciona estructura predecible, inyección de dependencias y manejo robusto de estados.

#### **HTTP y Estado**
```json
"@angular/platform-browser": "^19.2.0"  // Adaptador para navegadores
"rxjs": "~7.8.0"                        // Programación reactiva
```
**¿Por qué?**: RxJS permite manejar eventos asíncronos (HTTP, WebSockets) de forma declarativa y componible.

#### **UI y Estilos**
```json
"@angular/material": "^19.2.19"         // Componentes Material Design
"bootstrap": "^5.3.8"                   // Grid y utilidades CSS
```
**¿Por qué?**: Material Design proporciona componentes accesibles y consistentes; Bootstrap complementa con utilidades de layout.

#### **Desarrollo**
```json
"typescript": "~5.7.2"                  // Superset tipado de JavaScript
"@angular/cli": "^19.2.13"              // Herramientas de línea de comandos
```
**¿Por qué?**: TypeScript detecta errores en tiempo de desarrollo, no en producción.

---

## ✅ Tipos de Validaciones Implementadas

### 1. **Validación de Esquema (Backend - Pydantic)**

**Ejemplo**: Creación de licitaciones
```python
class TenderCreate(BaseModel):
    external_id: str                     # Obligatorio
    title: str                           # Obligatorio
    budget_amount: Optional[float] = Field(None, ge=0)  # >= 0
    buyer_ruc: Optional[str] = Field(None, pattern=r"^\d{13}$")  # 13 dígitos
    budget_currency: str = "USD"         # Valor por defecto
```

**Validaciones**:
- ✅ Tipos de datos correctos
- ✅ Campos obligatorios presentes
- ✅ Valores numéricos en rangos válidos
- ✅ Patrones regex para formatos (RUC, emails, etc.)

### 2. **Validación de Negocio (Backend - Endpoints)**

**Ejemplo**: Solo el dueño de una licitación puede editarla
```python
@router.put("/tenders/{tender_id}")
def update_tender(tender_id: int, user_id: int):
    tender = db.query(Tender).filter(Tender.id == tender_id).first()
    user = db.query(User).filter(User.id == user_id).first()
    
    if tender.publishing_company_id != user.company_id:
        raise HTTPException(403, "No autorizado")
    # ... actualizar
```

**Validaciones**:
- ✅ Permisos basados en roles (admin de empresa)
- ✅ Propiedad de recursos (solo editar tus licitaciones)
- ✅ Estados válidos (no editar licitación cerrada)

### 3. **Validación de Formularios (Frontend - Reactive Forms)**

**Ejemplo**: Formulario de publicar licitación
```typescript
tenderForm = new FormGroup({
  title: new FormControl('', [Validators.required, Validators.minLength(10)]),
  budget_amount: new FormControl(null, [Validators.min(0)]),
  buyer_ruc: new FormControl('', [Validators.pattern(/^\d{13}$/)]),
  tender_end_date: new FormControl('', [this.dateRangeValidator])
});
```

**Validaciones**:
- ✅ Validación en tiempo real (feedback inmediato)
- ✅ Validaciones síncronas (campos obligatorios, patrones)
- ✅ Validaciones personalizadas (rangos de fechas coherentes)
- ✅ Deshabilitación de botones si formulario inválido

### 4. **Validación de Relaciones (Base de Datos - Foreign Keys)**

**Ejemplo**: Integridad referencial
```python
class Tender(Base):
    publishing_company_id = Column(Integer, ForeignKey('companies.id'), nullable=False)
    created_by_user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    winning_company_id = Column(Integer, ForeignKey('companies.id'), nullable=True)
```

**Validaciones**:
- ✅ No se puede crear licitación con empresa inexistente
- ✅ No se puede eliminar empresa con licitaciones activas
- ✅ Cascadas configuradas para datos huérfanos

---

## 🚧 Retos Encontrados y Soluciones

### Reto 1: **CORS Bloqueando Peticiones del Frontend**

**Problema**: 
```
Access-Control-Allow-Origin error
Frontend en localhost:4200 no podía llamar a 127.0.0.1:8000
```

**Causa**: Frontend usa `localhost:4200` pero a veces resuelve a `127.0.0.1:4200`, y CORS solo aceptaba `localhost`.

**Solución**:
```python
# Backend/app.py
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:4200",
        "http://127.0.0.1:4200"  # Ambas variantes
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)
```

---

### Reto 2: **Ambiguous Foreign Keys en SQLAlchemy**

**Problema**:
```
sqlalchemy.exc.AmbiguousForeignKeysError: 
Could not determine join condition between parent/child tables on relationship Participation.tender
```

**Causa**: La tabla `Tender` tiene dos foreign keys a `Participation`:
- `Tender.winning_participation_id → Participation.id`
- `Participation.tender_id → Tender.id`

SQLAlchemy no sabía cuál usar para la relación `Participation.tender`.

**Solución**:
```python
# Backend/models/participation.py
class Participation(Base):
    tender = relationship(
        "Tender",
        back_populates="participations",
        foreign_keys=[tender_id]  # Especificar explícitamente
    )

# Backend/models/tender.py
class Tender(Base):
    winning_participation = relationship(
        "Participation",
        foreign_keys=[winning_participation_id],
        post_update=True  # Resolver dependencia circular
    )
```

---

### Reto 3: **Pydantic V2 Deprecation Warnings**

**Problema**:
```
PydanticDeprecatedSince20: `orm_mode` is deprecated. Use `ConfigDict(from_attributes=True)` instead.
```

**Causa**: Upgrade a Pydantic V2 cambió la API de configuración.

**Solución**: Migrar todos los schemas (9 archivos):
```python
# Antes (Pydantic V1)
class UserRead(BaseModel):
    id: int
    email: str
    
    class Config:
        orm_mode = True

# Después (Pydantic V2)
from pydantic import ConfigDict

class UserRead(BaseModel):
    id: int
    email: str
    
    model_config = ConfigDict(from_attributes=True)
```

---

### Reto 4: **Autenticación No Enviada al Backend**

**Problema**: 
```
Usuario se autentica en frontend, pero backend responde:
401 Unauthorized - "No se proporcionó ID de usuario"
```

**Causa**: Frontend guardaba `userId` en `localStorage` pero no lo enviaba en las peticiones HTTP.

**Solución**: Crear HTTP Interceptor
```typescript
// frontend/src/app/interceptors/auth.interceptor.ts
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const userId = localStorage.getItem('userId');
  if (userId) {
    const clonedRequest = req.clone({
      setHeaders: { 'X-User-Id': userId }  // Agregar header
    });
    return next(clonedRequest);
  }
  return next(req);
};

// Backend/api/v1/routes_tenders.py
def get_current_user_id(x_user_id: str = Header(None)) -> int:
    if not x_user_id:
        raise HTTPException(401, "No se proporcionó ID de usuario")
    return int(x_user_id)
```

---

### Reto 5: **Modal con Navegación (Flash Blanco)**

**Problema**: 
```
Al hacer clic en "Publicar Licitación", el fondo se ponía blanco
como si cambiara de página.
```

**Causa**: Modal implementado como ruta (`/publicar-licitacion`), causando navegación real.

**Solución**: Patrón Service + BehaviorSubject
```typescript
// frontend/src/app/services/modal.service.ts
@Injectable({ providedIn: 'root' })
export class ModalService {
  private publishTenderModalOpen = new BehaviorSubject<boolean>(false);
  publishTenderModal$ = this.publishTenderModalOpen.asObservable();
  
  openPublishTenderModal() { this.publishTenderModalOpen.next(true); }
  closePublishTenderModal() { this.publishTenderModalOpen.next(false); }
}

// Sidebar: click llama al servicio (no router.navigate)
openPublishModal() {
  this.modalService.openPublishTenderModal();
}

// Modal template: *ngIf con async pipe
<div *ngIf="modalService.publishTenderModal$ | async" class="overlay">
  <!-- contenido del modal -->
</div>
```

**Resultado**: Modal aparece como overlay sin cambiar la URL ni recargar la página.

---

## 🔐 Seguridad Implementada

1. **SQL Injection**: Prevenido con SQLAlchemy ORM (parámetros preparados)
2. **XSS**: Angular sanitiza automáticamente el DOM
3. **CSRF**: Tokens en formularios (pendiente para producción)
4. **Autenticación**: Headers HTTP + validación en cada endpoint
5. **Autorización**: Verificación de permisos basada en empresa/rol

---

## 📚 Convenciones del Código

### Backend
- **Naming**: `snake_case` para variables/funciones, `PascalCase` para clases
- **Rutas**: `/api/v1/recurso` con versionado
- **Responses**: Siempre usar schemas Pydantic (no dicts crudos)
- **Errores**: `HTTPException` con códigos HTTP estándar

### Frontend
- **Naming**: `camelCase` para variables/funciones, `PascalCase` para clases/componentes
- **Archivos**: `feature-name.component.ts` (kebab-case)
- **Services**: Inyectados por DI, no instanciados manualmente
- **Observables**: Sufijo `$` por convención (`user$`, `tenders$`)

---

## 🚀 Inicio Rápido

**Ver guía completa de instalación en**: [INSTALACION.md](./INSTALACION.md)

```powershell
# Opción rápida con VS Code Tasks
1. Abrir proyecto en VS Code
2. F1 → Tasks: Run Task
3. Seleccionar "🚀🎨 Levantar Backend + Frontend"

# Acceder a:
Frontend: http://localhost:4200
Backend API Docs: http://127.0.0.1:8000/docs
```

---

## 📝 Licencia

Este repositorio es parte del Trabajo de Integración Curricular. Verificar las condiciones de uso antes de distribuir.
