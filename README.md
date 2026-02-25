# Content Suite - Sistema de Gestión de Contenido con IA

Sistema completo de IA para garantizar la consistencia de marca en lanzamientos masivos de productos, integrando un ecosistema de agentes, RAG multimodal y gobernanza de datos.

## Arquitectura

```
┌─────────────────────────────────────────────────────────────────┐
│                     FRONTEND (Next.js)                          │
│   Creador │ Aprobador A │ Aprobador B │ Admin                  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    BACKEND (FastAPI)                            │
│   Brand DNA │ Creative Engine │ Governance │ Langfuse           │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                SUPABASE (PostgreSQL + pgvector)                │
└─────────────────────────────────────────────────────────────────┘
                              │
              ┌───────────────┼───────────────┐
              ▼               ▼               ▼
         Groq Cloud    Google AI       Langfuse
         (LLM Text)    Studio          (Observability)
                       (Vision)
```

## Tech Stack

- **Backend**: FastAPI + Python 3.11
- **Frontend**: Next.js 14 + TypeScript
- **Database**: Supabase (PostgreSQL + pgvector)
- **LLM**: Groq Cloud (llama-3.1)
- **Vision**: Google AI Studio (Gemini)
- **Observability**: Langfuse
- **Auth**: JWT + bcrypt

## Quick Start

### 1. Configurar Base de Datos

1. Crear proyecto en [Supabase](https://supabase.com)
2. Ejecutar `backend/database.sql` en el SQL Editor

### 2. Configurar Backend

```bash
cd backend

# Copiar archivo de entorno
cp .env.example .env

# Editar .env con tus credenciales
# (ver .env.example para las variables necesarias)

# Instalar dependencias con uv
uv sync

# Ejecutar servidor
uv run uvicorn app.main:app --reload --port 8000
```

### 3. Configurar Frontend

```bash
cd frontend

# Copiar archivo de entorno
cp .env.example .env.local

# Instalar dependencias
npm install

# Ejecutar servidor
npm run dev
```

### 4. Acceder a la Aplicación

- Frontend: http://localhost:3000
- API Docs: http://localhost:8000/docs

## Usuarios de Prueba

| Email | Contraseña | Rol |
|-------|------------|-----|
| admin@alicorp.com | admin123 | Administrador |
| creador@alicorp.com | admin123 | Creador de Contenido |
| aprobadora@alicorp.com | admin123 | Aprobador de Contenido |
| aprobadorb@alicorp.com | admin123 | Auditor Visual |

## Módulos

### Módulo I: Brand DNA Architect
- Crear manuales de marca estructurados
- Almacenamiento en base vectorial para RAG

### Módulo II: Creative Engine
- Generación de descripciones de producto
- Generación de guiones de video
- Generación de prompts de imagen

### Módulo III: Governance & Audit
- Flujo de aprobación (Pendiente → Aprobado/Rechazado)
- Auditoría multimodal con Gemini

### Módulo IV: Observabilidad
- Trazabilidad con Langfuse
- Métricas de uso y costos

## Variables de Entorno

### Backend (.env)
```
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_ANON_KEY=tu-anon-key
SUPABASE_SERVICE_KEY=tu-service-key
GROQ_API_KEY=tu-groq-key
GEMINI_API_KEY=tu-gemini-key
LANGFUSE_PUBLIC_KEY=tu-langfuse-public
LANGFUSE_SECRET_KEY=tu-langfuse-secret
JWT_SECRET_KEY=tu-secret-key-min-32-caracteres
```

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## Despliegue

### Render (Backend)
1. Conectar repositorio a Render
2. Configurar Build Command: `pip install -r requirements.txt`
3. Configurar Start Command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
4. Agregar variables de entorno

### Vercel (Frontend)
1. Importar proyecto en Vercel
2. Configurar variables de entorno
3. Deploy automático

## Licencia

MIT
