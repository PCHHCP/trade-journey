import os
from pathlib import Path

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

# Determine which .env file to load based on APP_ENV:
#   APP_ENV=production → .env.production
#   APP_ENV unset      → .env (local development)
_app_env = os.getenv("APP_ENV", "")
_env_file = ".env.production" if _app_env == "production" else ".env"
_env_path = Path(__file__).resolve().parent.parent / _env_file


class Settings(BaseSettings):
    # --- Database ---
    # Async PostgreSQL connection string (asyncpg driver)
    database_url: str

    # --- Supabase Auth ---
    # Base project URL, e.g. https://<project-ref>.supabase.co
    supabase_url: str

    # --- CORS ---
    # Comma-separated list of allowed origins (e.g. "http://localhost:5173,https://tyche.com")
    cors_origins: str

    # --- Debug ---
    # Enable debug mode (SQL echo, verbose logging)
    debug: bool = False

    model_config = SettingsConfigDict(
        env_file=str(_env_path),
        env_file_encoding="utf-8",
    )

    @field_validator("supabase_url")
    @classmethod
    def validate_supabase_url(cls, value: str) -> str:
        url = value.strip().rstrip("/")
        if not url:
            raise ValueError(
                "SUPABASE_URL must be set to your Supabase project URL, "
                "for example https://<project-ref>.supabase.co."
            )
        return url

    @property
    def cors_origin_list(self) -> list[str]:
        """Parse comma-separated CORS_ORIGINS into a list."""
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]

    @property
    def supabase_issuer(self) -> str:
        return f"{self.supabase_url}/auth/v1"

    @property
    def supabase_jwks_url(self) -> str:
        return f"{self.supabase_issuer}/.well-known/jwks.json"


settings = Settings()
