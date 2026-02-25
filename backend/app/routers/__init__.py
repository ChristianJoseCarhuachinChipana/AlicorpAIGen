from app.routers.auth import router as auth_router
from app.routers.brand import router as brand_router
from app.routers.contenido import router as contenido_router
from app.routers.auditoria import router as auditoria_router

__all__ = ["auth_router", "brand_router", "contenido_router", "auditoria_router"]
