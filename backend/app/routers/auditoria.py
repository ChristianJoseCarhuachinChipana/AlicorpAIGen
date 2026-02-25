from typing import List
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from fastapi.responses import JSONResponse, PlainTextResponse
from app.database import get_supabase
from app.models.user import UserResponse
from app.models.auditoria import AuditoriaCreate, AuditoriaResponse
from app.dependencies.auth import get_current_user, require_role
from app.models.user import UserRole
from app.services import analyze_image, get_brand_manual_by_id, format_brand_context
import base64

router = APIRouter(prefix="/api/auditoria", tags=["Governance & Audit"])


@router.post("/image")
async def audit_image(
    contenido_id: str = Form(...),
    image: UploadFile = File(...),
    current_user: UserResponse = Depends(
        require_role([UserRole.APROBADOR_B, UserRole.ADMIN])
    ),
):
    supabase = get_supabase()

    contenido_response = (
        supabase.table("contenido").select("*").eq("id", contenido_id).execute()
    )
    if not contenido_response.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Contenido no encontrado"
        )

    contenido = contenido_response.data[0]
    manual = await get_brand_manual_by_id(contenido["brand_manual_id"])

    if not manual:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Manual de marca no encontrado",
        )

    brand_context = format_brand_context(manual)

    image_data = await image.read()
    image_base64 = base64.b64encode(image_data).decode("utf-8")

    result = await analyze_image(
        image_data=image_base64,
        brand_manual_context=brand_context,
        contenido_text=contenido.get("contenido_text", ""),
    )

    if not result["success"]:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al analizar imagen: {result.get('error')}",
        )

    auditoria_data = {
        "contenido_id": contenido_id,
        "imagen_url": f"data:{image.content_type};base64,{image_base64}",
        "resultado": {
            "cumple": result.get("score", 0) >= 0.7,
            "score": result.get("score", 0),
        },
        "gemini_analysis": result.get("analysis", ""),
        "score_conformidad": result.get("score", 0),
        "audited_by": current_user.id,
    }

    response = supabase.table("auditorias").insert(auditoria_data).execute()

    if not response.data:
        raise HTTPException(
            status_code=status.HTTP_500_SERVER_ERROR,
            detail="Error al guardar auditoría",
        )

    return {
        "auditoria": AuditoriaResponse(**response.data[0]),
        "analisis": result.get("analysis", ""),
        "score": result.get("score", 0),
    }


@router.get("/contenido/{contenido_id}", response_model=List[AuditoriaResponse])
async def get_auditorias_by_contenido(
    contenido_id: str, current_user: UserResponse = Depends(get_current_user)
):
    supabase = get_supabase()
    response = (
        supabase.table("auditorias")
        .select("*")
        .eq("contenido_id", contenido_id)
        .execute()
    )

    return [AuditoriaResponse(**item) for item in (response.data or [])]


@router.get("/", response_model=List[AuditoriaResponse])
async def list_auditorias(
    limit: int = 20, current_user: UserResponse = Depends(get_current_user)
):
    supabase = get_supabase()
    response = (
        supabase.table("auditorias")
        .select("*")
        .order("created_at", desc=True)
        .limit(limit)
        .execute()
    )

    return [AuditoriaResponse(**item) for item in (response.data or [])]


@router.get("/{auditoria_id}/imagen", response_class=PlainTextResponse)
async def get_auditoria_imagen(
    auditoria_id: str, current_user: UserResponse = Depends(get_current_user)
):
    supabase = get_supabase()
    response = (
        supabase.table("auditorias")
        .select("imagen_url")
        .eq("id", auditoria_id)
        .execute()
    )

    if not response.data or not response.data[0].get("imagen_url"):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Imagen de auditoría no encontrada",
        )

    return response.data[0]["imagen_url"]
