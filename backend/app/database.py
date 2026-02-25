from supabase import create_client, Client
from app.config import settings

supabase: Client = None


def get_supabase() -> Client:
    global supabase
    if supabase is None:
        supabase = create_client(
            settings.supabase_url,
            settings.supabase_anon_key
        )
    return supabase


def get_supabase_admin() -> Client:
    return create_client(
        settings.supabase_url,
        settings.supabase_service_key
    )
