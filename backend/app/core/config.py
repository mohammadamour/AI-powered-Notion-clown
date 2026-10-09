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

    # LLM Configuration (ready for Gemini integration)
    LLM_PROVIDER: str = "gemini"  # "gemini" or "mock"
    GEMINI_API_KEY: str = ""
    LLM_MODEL: str = "gemini-1.5-pro"

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()
