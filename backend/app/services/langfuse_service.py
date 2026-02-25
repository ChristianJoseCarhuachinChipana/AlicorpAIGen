import os
from typing import Optional
from langfuse import Langfuse
from app.config import settings

langfuse_client: Optional[Langfuse] = None

def get_langfuse() -> Langfuse:
    global langfuse_client
    if langfuse_client is None:
        if settings.langfuse_public_key and settings.langfuse_secret_key:
            langfuse_client = Langfuse(
                public_key=settings.langfuse_public_key,
                secret_key=settings.langfuse_secret_key,
                host=settings.langfuse_host
            )
    return langfuse_client

def langfuse_trace(name: str):
    def decorator(func):
        lf = get_langfuse()
        if lf:
            return lf.observe(name=name, trace_name=name)(func)
        return func
    return decorator

def log_generation(
    name: str,
    input_text: str,
    output_text: str,
    model: str,
    usage: dict = None,
    metadata: dict = None
):
    try:
        lf = get_langfuse()
        if lf:
            generation = lf.generation(
                name=name,
                input=input_text,
                output=output_text,
                model=model,
                usage=usage or {},
                metadata=metadata or {}
            )
            return generation
    except Exception:
        pass
    return None
