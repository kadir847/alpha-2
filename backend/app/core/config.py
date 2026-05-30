from functools import lru_cache

from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "Alpha 2"
    environment: str = "development"
    secret_key: str = Field(..., min_length=16)
    access_token_expire_minutes: int = 60 * 24 * 7
    database_url: str
    redis_url: str | None = None
    cors_origins_raw: str = Field("http://localhost:5173", alias="CORS_ORIGINS")
    rate_limit_per_minute: int = 60
    ai_provider: str = "openai"
    ai_model: str = "gpt-4o-mini"
    openai_api_key: str | None = None
    groq_api_key: str | None = None
    anthropic_api_key: str | None = None
    max_context_messages: int = 24

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    @field_validator("redis_url", mode="before")
    @classmethod
    def empty_redis_url_is_none(cls, value: str | None) -> str | None:
        if value == "":
            return None
        return value

    @property
    def cors_origins(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins_raw.split(",") if origin.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
