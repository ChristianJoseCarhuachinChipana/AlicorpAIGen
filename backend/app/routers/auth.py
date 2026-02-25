from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from app.database import get_supabase
from app.models.user import UserCreate, UserLogin, UserResponse, Token
from app.dependencies.auth import verify_password, get_password_hash, create_access_token, get_current_user
from app.config import settings

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/register", response_model=UserResponse)
async def register(user: UserCreate):
    supabase = get_supabase()
    
    response = supabase.table("users").select("*").eq("email", user.email).execute()
    if response.data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El email ya está registrado"
        )
    
    user_data = {
        "email": user.email,
        "password_hash": get_password_hash(user.password),
        "nombre": user.nombre,
        "role": user.role.value
    }
    
    response = supabase.table("users").insert(user_data).execute()
    
    if not response.data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Error al crear usuario"
        )
    
    return UserResponse(**response.data[0])


@router.post("/login", response_model=Token)
async def login(credentials: UserLogin):
    supabase = get_supabase()
    
    response = supabase.table("users").select("*").eq("email", credentials.email).execute()
    
    if not response.data:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciales incorrectas"
        )
    
    user_data = response.data[0]
    
    if not verify_password(credentials.password, user_data["password_hash"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciales incorrectas"
        )
    
    if not user_data.get("is_active", True):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Usuario inactivo"
        )
    
    access_token = create_access_token(
        data={"sub": user_data["id"], "email": user_data["email"]},
        expires_delta=timedelta(minutes=settings.jwt_expire_minutes)
    )
    
    user_response = UserResponse(**user_data)
    
    return Token(
        access_token=access_token,
        user=user_response
    )


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: UserResponse = Depends(get_current_user)):
    return current_user
