from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional
import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent.parent

class Settings(BaseSettings):
    PROJECT_NAME: str = "ThreatDNA-AI"
    TAGLINE: str = "AI-Powered IDS Alert Analysis & Prioritization Platform"
    API_V1_STR: str = "/api"
    
    # Database
    DATABASE_URL: str = "sqlite:///./threatdna_ai.db"
    
    # JWT
    JWT_SECRET_KEY: str = "threatdna_ai_super_secret_cyber_security_jwt_key_2026_soc_platform"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440
    
    # LLM Providers
    LLM_PROVIDER: str = "gemini"  # "gemini", "openai", "heuristic"
    LLM_MODEL: str = "gemini-2.5-flash"
    GEMINI_API_KEY: Optional[str] = None
    OPENAI_API_KEY: Optional[str] = None
    
    # CORS
    FRONTEND_URL: str = "http://localhost:5173"
    
    # Storage
    UPLOADS_DIR: str = str(BASE_DIR / "uploads")
    
    model_config = SettingsConfigDict(
        env_file=str(BASE_DIR / ".env"),
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()
os.makedirs(settings.UPLOADS_DIR, exist_ok=True)
