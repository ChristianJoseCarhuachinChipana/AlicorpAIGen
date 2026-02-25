from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class BrandManualBase(BaseModel):
    nombre: str
    producto: str
    tono: str
    público_objetivo: str
    restricciones: str


class BrandManualCreate(BrandManualBase):
    pass


class BrandManualUpdate(BaseModel):
    nombre: Optional[str] = None
    producto: Optional[str] = None
    tono: Optional[str] = None
    público_objetivo: Optional[str] = None
    restricciones: Optional[str] = None
    contenido_markdown: Optional[str] = None


class BrandManualResponse(BrandManualBase):
    id: str
    contenido_markdown: Optional[str] = None
    version: int
    created_by: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
