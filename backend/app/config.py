"""Application settings loaded from environment variables.

Contracts live in code: this is the single source of truth for runtime config.
"""
from __future__ import annotations

from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    # LLM
    llm_provider: str = "openai"
    llm_api_key: str = ""
    llm_base_url: str | None = None
    llm_planner_model: str = "gpt-4o-mini"
    llm_coder_model: str = "gpt-4o"
    llm_timeout_seconds: int = 20

    # Engine
    max_repair_retries: int = 3
    sandbox_timeout_seconds: int = 10

    # Persistence
    registry_backend: str = "sqlite"  # sqlite | json
    registry_path: str = "data/mycelium.db"
    workflow_backend: str = "sqlite"  # sqlite | json
    workflow_path: str = "data/workflows.db"

    # CORS
    frontend_origin: str = "http://localhost:3000"


@lru_cache
def get_settings() -> Settings:
    return Settings()
