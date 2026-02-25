import os
from typing import Optional, Dict, Any
from groq import AsyncGroq
from app.config import settings
from app.services.langfuse_service import log_generation

groq_client: Optional[AsyncGroq] = None


def get_groq_client() -> AsyncGroq:
    global groq_client
    if groq_client is None:
        if settings.groq_api_key:
            groq_client = AsyncGroq(api_key=settings.groq_api_key)
    return groq_client


async def generate_text(
    prompt: str,
    system_prompt: str = "Eres un asistente útil.",
    model: str = "llama-3.3-70b-versatile",
    temperature: float = 0.7,
    max_tokens: int = 2048,
    trace_name: str = "groq-generation"
) -> Dict[str, Any]:
    client = get_groq_client()
    
    if not client:
        return {
            "success": False,
            "error": "Groq API no configurada",
            "text": None
        }

    try:
        response = await client.chat.completions.create(
            model=model,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": prompt}
            ],
            temperature=temperature,
            max_tokens=max_tokens
        )
        
        result_text = response.choices[0].message.content
        
        usage = {
            "prompt_tokens": response.usage.prompt_tokens,
            "completion_tokens": response.usage.completion_tokens,
            "total_tokens": response.usage.total_tokens
        }
        
        log_generation(
            name=trace_name,
            input_text=prompt,
            output_text=result_text,
            model=model,
            usage=usage,
            metadata={"system_prompt": system_prompt[:100]}
        )
        
        return {
            "success": True,
            "text": result_text,
            "usage": usage,
            "model": model
        }
        
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "text": None
        }


async def generate_brand_manual(
    producto: str,
    tono: str,
    publica_objetivo: str,
    restricciones: str
) -> Dict[str, Any]:
    system_prompt = """Eres un experto en branding y marketing. Tu tarea es crear un Manual de Marca estructurado y completo."""
    
    prompt = f"""Crea un Manual de Marca detallado con la siguiente información:

**Producto/Servicio:** {producto}
**Tono de comunicación:** {tono}
**Público objetivo:** {publica_objetivo}
**Restricciones:** {restricciones}

El manual debe incluir:
1. Identidad de marca
2. Valores de marca
3. Guía de tono y voz
4. Paleta de colores recomendada
5. Tipografía sugerida
6. Mensajes clave
7. Ejemplos de contenido (descripciones, headlines)
8. Errores a evitar

Formato: Markdown estructurado."""

    return await generate_text(
        prompt=prompt,
        system_prompt=system_prompt,
        trace_name="brand-manual-generation"
    )


async def generate_contenido(
    tipo_contenido: str,
    brand_manual_context: str,
    producto: str,
    titulo: str
) -> Dict[str, Any]:
    prompts = {
        "descripcion": f"""Basándote en el manual de marca y las directrices de producto, crea una descripción de producto profesional y atractiva.

Producto: {titulo}
{producto}

Contexto del manual de marca:
{brand_manual_context}

La descripción debe ser persuasiva, adecuada al tono de marca, y lista para usar en e-commerce.""",
        
        "guion_video": f"""Crea un guion de video marketing profesional.

Producto: {titulo}
{producto}

Contexto del manual de marca:
{brand_manual_context}

El guion debe incluir:
- Introducción hook
- Beneficios clave
- Llamada a la acción
- Duración estimada: 30-60 segundos""",
        
        "prompt_imagen": f"""Crea un prompt detallado para generación de imagen IA.

Producto: {titulo}
{producto}

Contexto del manual de marca:
{brand_manual_context}

El prompt debe ser detallado, especificar estilo visual, iluminación, composición, y debe ser coherente con la identidad de marca."""
    }
    
    prompt = prompts.get(tipo_contenido, prompts["descripcion"])
    
    system_prompt = """Eres un experto en marketing de contenidos. Crea contenido de alta calidad alineado con la marca."""
    
    return await generate_text(
        prompt=prompt,
        system_prompt=system_prompt,
        trace_name=f"content-generation-{tipo_contenido}"
    )
