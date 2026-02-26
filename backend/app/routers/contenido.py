from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from app.database import get_supabase
from app.models.user import UserResponse
from app.models.contenido import (
    ContenidoCreate,
    ContenidoUpdate,
    ContenidoResponse,
    EstadoContenido,
)
from app.dependencies.auth import get_current_user, require_role
from app.models.user import UserRole
from app.services import (
    generate_contenido,
    get_brand_manual_by_id,
    format_brand_context,
)

router = APIRouter(prefix="/api/contenido", tags=["Creative Engine"])


@router.post("/", response_model=ContenidoResponse)
async def create_contenido(
    contenido: ContenidoCreate,
    current_user: UserResponse = Depends(
        require_role([UserRole.CREADOR, UserRole.ADMIN])
    ),
):
    manual = await get_brand_manual_by_id(contenido.brand_manual_id)

    if not manual:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Manual de marca no encontrado",
        )

    brand_context = format_brand_context(manual)

    result = await generate_contenido(
        tipo_contenido=contenido.tipo.value,
        brand_manual_context=brand_context,
        producto=manual.producto,
        titulo=contenido.titulo,
    )

    if not result["success"]:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al generar contenido: {result.get('error')}",
        )

    supabase = get_supabase()
    contenido_data = {
        "brand_manual_id": contenido.brand_manual_id,
        "tipo": contenido.tipo.value,
        "titulo": contenido.titulo,
        "contenido_text": result["text"],
        "estado": EstadoContenido.PENDIENTE.value,
        "created_by": current_user.id,
    }

    response = supabase.table("contenido").insert(contenido_data).execute()

    if not response.data:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error al guardar el contenido",
        )

    return ContenidoResponse(**response.data[0])


@router.get("/", response_model=List[ContenidoResponse])
async def list_contenido(
    estado: str = None, current_user: UserResponse = Depends(get_current_user)
):
    supabase = get_supabase()
    query = supabase.table("contenido").select("*")

    if estado:
        query = query.eq("estado", estado)

    response = query.order("created_at", desc=True).execute()

    return [ContenidoResponse(**item) for item in (response.data or [])]


@router.get("/{contenido_id}", response_model=ContenidoResponse)
async def get_contenido(
    contenido_id: str, current_user: UserResponse = Depends(get_current_user)
):
    supabase = get_supabase()
    response = supabase.table("contenido").select("*").eq("id", contenido_id).execute()

    if not response.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Contenido no encontrado"
        )

    return ContenidoResponse(**response.data[0])


@router.patch("/{contenido_id}/aprobar")
async def approve_contenido(
    contenido_id: str,
    current_user: UserResponse = Depends(
        require_role([UserRole.APROBADOR_A, UserRole.ADMIN])
    ),
):
    supabase = get_supabase()
    response = (
        supabase.table("contenido")
        .update(
            {
                "estado": EstadoContenido.APROBADO.value,
                "aprobado_por": current_user.id,
                "updated_at": "now()",
            }
        )
        .eq("id", contenido_id)
        .execute()
    )

    if not response.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Contenido no encontrado"
        )

    return {"message": "Contenido aprobado", "contenido": response.data[0]}


@router.patch("/{contenido_id}/rechazar")
async def reject_contenido(
    contenido_id: str,
    rechazo_razon: str,
    current_user: UserResponse = Depends(
        require_role([UserRole.APROBADOR_A, UserRole.ADMIN])
    ),
):
    supabase = get_supabase()
    response = (
        supabase.table("contenido")
        .update(
            {
                "estado": EstadoContenido.RECHAZADO.value,
                "rechazo_razon": rechazo_razon,
                "updated_at": "now()",
            }
        )
        .eq("id", contenido_id)
        .execute()
    )

    if not response.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Contenido no encontrado"
        )

    return {"message": "Contenido rechazado", "contenido": response.data[0]}
