import logging
from typing import Optional
from langfuse import Langfuse
from app.config import settings

logger = logging.getLogger(__name__)

langfuse_client: Optional[Langfuse] = None


def get_langfuse() -> Optional[Langfuse]:
    """
    Obtiene o crea el cliente de Langfuse.
    Retorna None si las credenciales no están configuradas.
    """
    global langfuse_client

    if langfuse_client is not None:
        return langfuse_client

    public_key = settings.langfuse_public_key
    secret_key = settings.langfuse_secret_key
    host = settings.langfuse_host

    if not public_key or not secret_key:
        logger.warning("Langfuse credentials not configured - tracing disabled")
        return None

    try:
        # Inicialización directa con las credenciales de settings
        langfuse_client = Langfuse(
            public_key=public_key,
            secret_key=secret_key,
            host=host,
        )
        logger.info("Langfuse client initialized successfully")
    except Exception as e:
        logger.error(f"Failed to initialize Langfuse client: {e}")
        return None

    return langfuse_client


def langfuse_trace(name: str):
    """
    Decorador para hacer tracing de funciones con Langfuse usando observations.
    """

    def decorator(func):
        lf = get_langfuse()
        if lf:
            def wrapper(*args, **kwargs):
                with lf.start_as_current_observation(as_type="span", name=name) as span:
                    try:
                        result = func(*args, **kwargs)
                        span.update(output="Function executed successfully")
                        return result
                    except Exception as e:
                        span.update(output=f"Error: {e}")
                        raise
            return wrapper
        return func

    return decorator


def log_generation(
    name: str,
    input_text: str,
    output_text: str,
    model: str,
    usage: Optional[dict] = None,
    metadata: Optional[dict] = None,
) -> Optional[object]:
    """
    Registra una generación en Langfuse para visualización en el dashboard.
    """
    try:
        lf = get_langfuse()
        if not lf:
            logger.debug("Langfuse not configured - skipping generation log")
            return None

        # Crear un span principal
        with lf.start_as_current_observation(as_type="span", name=name) as span:
            span.update(input=input_text, output=output_text, metadata=metadata or {})

            # Crear una generación anidada
            with lf.start_as_current_observation(
                as_type="generation",
                name=f"{name}-generation",
                model=model,
            ) as generation:
                generation.update(
                    input=input_text,
                    output=output_text,
                    usage=usage or {},
                    metadata=metadata or {},
                )

        try:
            lf.flush()
        except Exception as flush_error:
            logger.warning(f"Langfuse flush error: {flush_error}")

        logger.info(f"Langfuse generation logged: {name} (model: {model})")
        return True

    except Exception as e:
        logger.error(f"Langfuse logging error: {e}")
        return None
