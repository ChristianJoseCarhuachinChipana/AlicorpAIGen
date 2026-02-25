from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from enum import Enum


class TipoContenido(str, Enum):
    DESCRIPCION = "descripcion"
    GUION_VIDEO = "guion_video"
    PROMPT_IMAGEN = "prompt_imagen"


class EstadoContenido(str, Enum):
    PENDIENTE = "pendiente"
    APROBADO = "aprobado"
    RECHAZADO = "rechazado"


class ContenidoBase(BaseModel):
    tipo: TipoContenido
    titulo: str


class ContenidoCreate(ContenidoBase):
    brand_manual_id: str


class ContenidoUpdate(BaseModel):
    estado: Optional[EstadoContenido] = None
    rechazo_razon: Optional[str] = None


class ContenidoResponse(ContenidoBase):
    id: str
    brand_manual_id: str
    contenido_text: Optional[str] = None
    estado: str
    aprobado_por: Optional[str] = None
    rechazo_razon: Optional[str] = None
    created_by: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
