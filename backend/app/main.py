from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.config import settings
from app.routers import auth_router, brand_router, contenido_router, auditoria_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    print("Content Suite API iniciando...")
    print(f"Debug mode: {settings.debug}")
    yield
    print("Content Suite API cerrando...")


app = FastAPI(
    title="Content Suite API",
    description="API para gestión de contenido de marca con IA",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(brand_router)
app.include_router(contenido_router)
app.include_router(auditoria_router)


@app.get("/")
async def root():
    return {
        "name": "Content Suite API",
        "version": "1.0.0",
        "status": "running",
        "docs": "/docs"
    }


@app.get("/health")
async def health_check():
    return {"status": "healthy"}
