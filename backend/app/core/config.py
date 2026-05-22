"""
Application configuration using Pydantic BaseSettings.
Loads values from environment variables or .env file.
"""

from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    # Database
    DATABASE_URL: str = "sqlite+aiosqlite:///./agrisupply.db"

    # JWT Authentication
    SECRET_KEY: str = "agrisupply-super-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # App metadata
    APP_NAME: str = "AgriSupply"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = True

    model_config = {
        "env_file": ".env",
        "extra": "ignore"
    }


@lru_cache()
def get_settings() -> Settings:
    """Cached settings instance — reads .env only once."""
    return Settings()
