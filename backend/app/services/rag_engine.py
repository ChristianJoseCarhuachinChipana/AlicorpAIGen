from typing import Optional, Dict, Any, List
from app.database import get_supabase
from app.models.brand_manual import BrandManualResponse


async def get_brand_manual_by_id(manual_id: str) -> Optional[BrandManualResponse]:
    supabase = get_supabase()
    response = supabase.table("brand_manuals").select("*").eq("id", manual_id).execute()
    
    if not response.data:
        return None
    
    return BrandManualResponse(**response.data[0])


async def get_latest_brand_manual() -> Optional[BrandManualResponse]:
    supabase = get_supabase()
    response = supabase.table("brand_manuals").select("*").order("created_at", desc=True).limit(1).execute()
    
    if not response.data:
        return None
    
    return BrandManualResponse(**response.data[0])


async def search_brand_manuals(query: str, limit: int = 5) -> List[BrandManualResponse]:
    supabase = get_supabase()
    
    response = supabase.table("brand_manuals").select("*").order("created_at", desc=True).limit(limit).execute()
    
    manuals = []
    for item in response.data or []:
        if query.lower() in item.get("contenido_markdown", "").lower() or \
           query.lower() in item.get("producto", "").lower() or \
           query.lower() in item.get("nombre", "").lower():
            manuals.append(BrandManualResponse(**item))
    
    return manuals


def format_brand_context(manual: BrandManualResponse) -> str:
    context_parts = []
    
    if manual.nombre:
        context_parts.append(f"Nombre de marca: {manual.nombre}")
    if manual.producto:
        context_parts.append(f"Producto: {manual.producto}")
    if manual.tono:
        context_parts.append(f"Tono: {manual.tono}")
    if manual.público_objetivo:
        context_parts.append(f"Público objetivo: {manual.público_objetivo}")
    if manual.restricciones:
        context_parts.append(f"Restricciones: {manual.restricciones}")
    if manual.contenido_markdown:
        context_parts.append(f"\nManual de marca:\n{manual.contenido_markdown}")
    
    return "\n".join(context_parts)
