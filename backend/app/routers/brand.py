from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from app.database import get_supabase
from app.models.user import UserResponse
from app.models.brand_manual import BrandManualCreate, BrandManualResponse
from app.dependencies.auth import get_current_user, require_role
from app.models.user import UserRole
from app.services import generate_brand_manual, get_brand_manual_by_id

router = APIRouter(prefix="/api/brand", tags=["Brand DNA"])


@router.post("/manual", response_model=BrandManualResponse)
async def create_brand_manual(
    manual: BrandManualCreate,
    current_user: UserResponse = Depends(require_role([UserRole.CREADOR, UserRole.ADMIN]))
):
    result = await generate_brand_manual(
        producto=manual.producto,
        tono=manual.tono,
        publica_objetivo=manual.público_objetivo,
        restricciones=manual.restricciones
    )
    
    if not result["success"]:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al generar manual: {result.get('error')}"
        )
    
    supabase = get_supabase()
    manual_data = {
        "nombre": manual.nombre,
        "producto": manual.producto,
        "tono": manual.tono,
        "público_objetivo": manual.público_objetivo,
        "restricciones": manual.restricciones,
        "contenido_markdown": result["text"],
        "created_by": current_user.id
    }
    
    response = supabase.table("brand_manuals").insert(manual_data).execute()
    
    if not response.data:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error al guardar el manual"
        )
    
    return BrandManualResponse(**response.data[0])


@router.get("/manual", response_model=List[BrandManualResponse])
async def list_brand_manuals(
    current_user: UserResponse = Depends(get_current_user)
):
    supabase = get_supabase()
    response = supabase.table("brand_manuals").select("*").order("created_at", desc=True).execute()
    
    return [BrandManualResponse(**item) for item in (response.data or [])]


@router.get("/manual/{manual_id}", response_model=BrandManualResponse)
async def get_brand_manual(
    manual_id: str,
    current_user: UserResponse = Depends(get_current_user)
):
    manual = await get_brand_manual_by_id(manual_id)
    
    if not manual:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Manual de marca no encontrado"
        )
    
    return manual


@router.delete("/manual/{manual_id}")
async def delete_brand_manual(
    manual_id: str,
    current_user: UserResponse = Depends(require_role([UserRole.ADMIN]))
):
    supabase = get_supabase()
    response = supabase.table("brand_manuals").delete().eq("id", manual_id).execute()
    
    if not response.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Manual de marca no encontrado"
        )
    
    return {"message": "Manual eliminado correctamente"}
