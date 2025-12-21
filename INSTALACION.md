# 🚀 Guía de Instalación - Sistema PYMES

Esta guía te permite instalar y ejecutar el proyecto completo en otro equipo desde cero.

---

## 📋 Requisitos Previos

Antes de comenzar, asegúrate de tener instalados:

### 1. **Node.js** (v22.x o superior)
- Descarga desde: https://nodejs.org/
- Verifica la instalación:
  ```powershell
  node --version
  npm --version
  ```
  Deberías ver: `v22.17.0` y `npm 10.9.2` (o superiores)

### 2. **Python** (v3.11.x)
- Descarga Python 3.11.9 desde: https://www.python.org/downloads/
- ⚠️ **IMPORTANTE**: Durante la instalación marca "Add Python to PATH"
- Verifica la instalación:
  ```powershell
  python --version
  ```
  Deberías ver: `Python 3.11.9`

### 3. **PostgreSQL** (v14 o superior)
- Descarga desde: https://www.postgresql.org/download/windows/
- Durante la instalación:
  - Usuario: `postgres`
  - Contraseña: `postgres` (o la que prefieras)
  - Puerto: `5432`
- Verifica la instalación (si está en PATH):
  ```powershell
  psql --version
  ```

### 4. **Git** (opcional, para clonar el repositorio)
- Descarga desde: https://git-scm.com/download/win

---

## 📦 Instalación del Proyecto

### 1️⃣ Clonar o Copiar el Proyecto

```powershell
# Si usas Git
git clone <URL_DEL_REPOSITORIO>
cd TESIS-PYMES

# Si copias manualmente
# Simplemente copia la carpeta TESIS-PYMES a tu equipo
```

---

### 2️⃣ Configurar la Base de Datos

#### Opción A: Usando pgAdmin (Interfaz Gráfica)
1. Abre **pgAdmin 4**
2. Conéctate al servidor PostgreSQL (localhost)
3. Click derecho en "Databases" → "Create" → "Database"
4. Nombre: `PYMES`
5. Guarda

#### Opción B: Usando la Terminal
```powershell
# Conectarse a PostgreSQL
psql -U postgres

# Crear la base de datos
CREATE DATABASE PYMES;

# Salir
\q
```

#### Cargar el Schema y Datos Iniciales
```powershell
# Ubicarte en la carpeta del proyecto
cd Backend

# Ejecutar el script SQL
psql -U postgres -d PYMES -f pymes1.sql
```

---

### 3️⃣ Configurar el Backend (FastAPI)

```powershell
# 1. Navega a la carpeta Backend
cd Backend

# 2. Crea el entorno virtual
python -m venv .venv-311

# 3. Activa el entorno virtual
.\.venv-311\Scripts\Activate.ps1

# 4. Actualiza pip
python -m pip install --upgrade pip

# 5. Instala las dependencias principales
pip install -r requirements.txt

# 6. Instala las dependencias adicionales (SQLAlchemy, psycopg2, etc.)
pip install sqlalchemy psycopg2-binary pydantic-settings

# 7. OPCIONAL: Si vas a usar el modelo de Machine Learning
pip install -r ml-requirements.txt

# 8. Verifica que todo esté instalado
pip list
```

#### Configurar Variables de Entorno (Opcional)

Si usas credenciales diferentes para PostgreSQL, crea un archivo `.env` en la carpeta `Backend`:

```env
DATABASE_URL=postgresql+psycopg2://postgres:TU_CONTRASEÑA@localhost:5432/PYMES
```

---

### 4️⃣ Configurar el Frontend (Angular)

```powershell
# 1. Navega a la carpeta frontend
cd ..\frontend

# 2. Instala las dependencias de Node.js
npm install

# 3. Verifica que Angular CLI esté instalado
ng version
```

Si `ng` no se reconoce, instala Angular CLI globalmente:
```powershell
npm install -g @angular/cli@19.2.13
```

---

## 🎯 Ejecutar el Proyecto

### Opción 1: Ejecutar Manualmente (Dos Terminales)

#### Terminal 1 - Backend:
```powershell
cd Backend
.\.venv-311\Scripts\Activate.ps1
python -m uvicorn app:app --reload --host 127.0.0.1 --port 8000
```
✅ Backend disponible en: http://127.0.0.1:8000

#### Terminal 2 - Frontend:
```powershell
cd frontend
npm start
```
✅ Frontend disponible en: http://localhost:4200

---

### Opción 2: Usar las Tareas de VS Code (Recomendado)

Si abres el proyecto en **Visual Studio Code**:

1. Presiona `F1` o `Ctrl + Shift + P`
2. Escribe: `Tasks: Run Task`
3. Selecciona una de estas opciones:
   - **🚀 Levantar Backend (FastAPI)**
   - **🎨 Levantar Frontend (Angular)**
   - **🚀🎨 Levantar Backend + Frontend** (ambos a la vez)

---

## 🧪 Verificar la Instalación

### 1. **Backend API**
Abre en el navegador: http://127.0.0.1:8000/docs

Deberías ver la documentación interactiva de FastAPI (Swagger UI)

### 2. **Frontend**
Abre en el navegador: http://localhost:4200

Deberías ver la página de login del sistema

### 3. **Conexión a Base de Datos**
Si el backend inicia correctamente sin errores, la conexión a PostgreSQL está OK.

---

## 📚 Estructura del Proyecto

```
TESIS-PYMES/
├── Backend/
│   ├── .venv-311/              # Entorno virtual Python
│   ├── api/                    # Endpoints REST
│   ├── core/                   # Configuración y DB
│   ├── models/                 # Modelos SQLAlchemy
│   ├── schemas/                # Schemas Pydantic
│   ├── app.py                  # Aplicación FastAPI
│   ├── requirements.txt        # Dependencias Python
│   ├── ml-requirements.txt     # Dependencias ML (opcional)
│   └── pymes1.sql              # Schema de base de datos
├── frontend/
│   ├── node_modules/           # Dependencias Node.js
│   ├── src/                    # Código fuente Angular
│   ├── package.json            # Configuración npm
│   └── angular.json            # Configuración Angular
└── .vscode/
    └── tasks.json              # Tareas automatizadas
```

---

## 🛠️ Comandos Útiles

### Backend
```powershell
# Activar entorno virtual
.\.venv-311\Scripts\Activate.ps1

# Desactivar entorno virtual
deactivate

# Ver paquetes instalados
pip list

# Actualizar dependencias
pip install -r requirements.txt --upgrade

# Crear migraciones (si usas Alembic)
alembic revision --autogenerate -m "descripcion"
alembic upgrade head
```

### Frontend
```powershell
# Iniciar servidor de desarrollo
npm start

# Construir para producción
npm run build

# Ejecutar tests
npm test

# Ver versión de Angular
ng version

# Actualizar Angular CLI
npm install -g @angular/cli@latest
```

### Base de Datos
```powershell
# Conectar a PostgreSQL
psql -U postgres -d PYMES

# Backup de la base de datos
pg_dump -U postgres PYMES > backup.sql

# Restaurar backup
psql -U postgres -d PYMES < backup.sql
```

---

## 🐛 Solución de Problemas Comunes

### ❌ Error: `python` no se reconoce
**Solución**: Python no está en el PATH. Reinstala Python marcando "Add Python to PATH"

### ❌ Error: `ng` no se reconoce
**Solución**: Instala Angular CLI globalmente:
```powershell
npm install -g @angular/cli@19.2.13
```

### ❌ Error: No se puede conectar a PostgreSQL
**Solución**: 
1. Verifica que PostgreSQL esté corriendo (busca "PostgreSQL" en Servicios de Windows)
2. Verifica las credenciales en `Backend/core/config.py`
3. Prueba la conexión: `psql -U postgres`

### ❌ Error: Puerto 8000 o 4200 ya está en uso
**Solución**: Mata el proceso que usa el puerto
```powershell
# Ver qué proceso usa el puerto
netstat -ano | findstr :8000
netstat -ano | findstr :4200

# Matar el proceso (usa el PID del comando anterior)
taskkill /PID <NUMERO_PID> /F
```

### ❌ Error: Cannot find module '@angular/...'
**Solución**: Reinstala las dependencias
```powershell
cd frontend
rm -r node_modules
rm package-lock.json
npm install
```

### ❌ Error: CORS en el navegador
**Solución**: Verifica que el backend esté en `127.0.0.1:8000` y el frontend en `localhost:4200` o `127.0.0.1:4200`

---

## 📝 Notas Importantes

1. **Python 3.11**: El proyecto usa Python 3.11.9. No usar Python 3.13 porque CatBoost no tiene binarios para esa versión aún.

2. **Angular 19**: El proyecto usa Angular 19.2.13 con componentes standalone y TypeScript 5.7.2

3. **PostgreSQL**: La base de datos se llama `PYMES` con usuario `postgres` y contraseña `postgres` por defecto.

4. **Entorno Virtual**: Siempre activa el entorno virtual `.venv-311` antes de trabajar con Python.

5. **Puertos**: 
   - Backend: `127.0.0.1:8000`
   - Frontend: `localhost:4200` o `127.0.0.1:4200`

6. **CORS**: El backend acepta peticiones desde `http://localhost:4200` y `http://127.0.0.1:4200`

---

## 🎉 ¡Listo!

Si seguiste todos los pasos, deberías tener el sistema completo funcionando. 

**Accede a:**
- Frontend: http://localhost:4200
- Backend API Docs: http://127.0.0.1:8000/docs
- Backend API: http://127.0.0.1:8000/api/v1/

---

## 📞 Soporte

Si tienes problemas, revisa:
1. Los logs del backend en la terminal
2. La consola del navegador (F12) para errores del frontend
3. Los logs de PostgreSQL en `C:\Program Files\PostgreSQL\<version>\data\log\`

---

**Versiones del Proyecto:**
- Python: 3.11.9
- Node.js: 22.17.0
- npm: 10.9.2
- Angular: 19.2.13
- TypeScript: 5.7.2
- FastAPI: 0.115.0
- PostgreSQL: 14+ (recomendado)
