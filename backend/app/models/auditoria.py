from pydantic import BaseModel
from typing import Optional, Dict, Any
from datetime import datetime


class AuditoriaCreate(BaseModel):
    contenido_id: str
    imagen_url: str


class AuditoriaResponse(BaseModel):
    id: str
    contenido_id: str
    imagen_url: Optional[str] = None
    resultado: Optional[Dict[str, Any]] = None
    gemini_analysis: Optional[str] = None
    score_conformidad: Optional[float] = None
    audited_by: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True
