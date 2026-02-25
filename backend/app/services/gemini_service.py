import base64
import os
from typing import Optional, Dict, Any
from google import genai
from google.genai.types import Part, File
from app.config import settings
from app.services.langfuse_service import log_generation

gemini_client: Optional[genai.Client] = None


def get_gemini_client() -> genai.Client:
    global gemini_client
    if gemini_client is None:
        if settings.gemini_api_key:
            gemini_client = genai.Client(api_key=settings.gemini_api_key)
    return gemini_client


async def analyze_image(
    image_data: str,
    brand_manual_context: str,
    contenido_text: str
) -> Dict[str, Any]:
    client = get_gemini_client()
    
    if not client:
        return {
            "success": False,
            "error": "Gemini API no configurada",
            "analysis": None,
            "score": 0.0
        }

    prompt = f"""Eres un experto en auditoría de marca. Analiza la imagen subida y compárala con el manual de marca y el contenido textual.

**Contenido textual a validar:**
{contenido_text}

**Manual de marca:**
{brand_manual_context}

**Instrucciones de análisis:**
1. Evalúa si la imagen es coherente con la identidad de marca
2. Verifica si el tono visual es apropiado
3. Comprobó uso correcto de colores y elementos gráficos
4. Detecta posibles violaciones de las restricciones de marca
5. Evalúa la calidad técnica de la imagen

**Respuesta requerida (formato JSON):**
{{
    "cumple": true/false,
    "score_conformidad": 0.0-1.0,
    "razones": ["lista de razones de cumplimiento o fallo"],
    "recomendaciones": ["sugerencias de mejora si no cumple"],
    "analisis_detallado": "explicación detallada del análisis"
}}"""

    try:
        if image_data.startswith("data:"):
            image_data = image_data.split(",", 1)[1]
        
        image_bytes = base64.b64decode(image_data)
        
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=[prompt, Part.from_bytes(data=image_bytes, mime_type="image/jpeg")]
        )
        
        result_text = response.text
        
        score = 0.8
        try:
            import json
            import re
            json_match = re.search(r'\{.*\}', result_text, re.DOTALL)
            if json_match:
                result_json = json.loads(json_match.group())
                score = result_json.get("score_conformidad", 0.8)
        except:
            pass
        
        log_generation(
            name="image-audit",
            input_text=prompt[:500],
            output_text=result_text[:1000],
            model="gemini-2.5-flash",
            metadata={"content_length": len(contenido_text)}
        )
        
        return {
            "success": True,
            "analysis": result_text,
            "score": score,
            "model": "gemini-2.5-flash"
        }
        
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "analysis": None,
            "score": 0.0
        }


async def analyze_image_from_url(
    image_url: str,
    brand_manual_context: str,
    contenido_text: str
) -> Dict[str, Any]:
    client = get_gemini_client()
    
    if not client:
        return {
            "success": False,
            "error": "Gemini API no configurada",
            "analysis": None,
            "score": 0.0
        }

    prompt = f"""Eres un experto en auditoría de marca. Analiza la imagen subida y compárala con el manual de marca y el contenido textual.

**Contenido textual a validar:**
{contenido_text}

**Manual de marca:**
{brand_manual_context}

**Instrucciones de análisis:**
1. Evalúa si la imagen es coherente con la identidad de marca
2. Verifica si el tono visual es apropiado
3. Comprueba uso correcto de colores y elementos gráficos
4. Detecta posibles violaciones de las restricciones de marca
5. Evalúa la calidad técnica de la imagen

**Respuesta requerida (formato JSON):**
{{
    "cumple": true/false,
    "score_conformidad": 0.0-1.0,
    "razones": ["lista de razones"],
    "recomendaciones": ["sugerencias"],
    "analisis_detallado": "explicación"
}}"""

    try:
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=[prompt, File(uri=image_url, mime_type="image/jpeg")]
        )
        
        result_text = response.text
        
        score = 0.8
        try:
            import json
            import re
            json_match = re.search(r'\{.*\}', result_text, re.DOTALL)
            if json_match:
                result_json = json.loads(json_match.group())
                score = result_json.get("score_conformidad", 0.8)
        except:
            pass
        
        log_generation(
            name="image-audit-url",
            input_text=prompt[:500],
            output_text=result_text[:1000],
            model="gemini-2.5-flash",
            metadata={"image_url": image_url}
        )
        
        return {
            "success": True,
            "analysis": result_text,
            "score": score,
            "model": "gemini-2.5-flash"
        }
        
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "analysis": None,
            "score": 0.0
        }
