from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    """Application settings, loaded from environment variables / .env file."""

    APP_NAME: str = "Second Brain"

    # CORS — which origins can talk to us
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",  # Next.js dev server
        "http://127.0.0.1:3000",
    ]

    # LLM Configuration (not used yet — ready for when you plug in)
    LLM_PROVIDER: str = "mock"  # "openai", "anthropic", or "mock"
    LLM_API_KEY: str = ""
    LLM_MODEL: str = "gpt-4o-mini"

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()
