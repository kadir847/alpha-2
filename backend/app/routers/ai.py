from fastapi import APIRouter

from app.core.config import settings

router = APIRouter()


@router.get("/status")
def ai_status() -> dict[str, str | bool]:
    configured = bool(settings.openai_api_key or settings.groq_api_key or settings.anthropic_api_key)
    provider = settings.ai_provider.lower()
    active_provider = "demo"

    if provider == "groq" and settings.groq_api_key:
        active_provider = "groq"
    elif provider == "anthropic" and settings.anthropic_api_key:
        active_provider = "anthropic"
    elif settings.openai_api_key:
        active_provider = "openai"

    return {
        "requested_provider": provider,
        "active_provider": active_provider,
        "demo_mode": active_provider == "demo",
        "configured": configured,
        "ai_model": settings.ai_model,
    }
