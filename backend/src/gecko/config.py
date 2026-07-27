import os
from pathlib import Path
from typing import Optional
from pydantic_settings import BaseSettings, SettingsConfigDict

# Base workspace directory (parent of backend/ or project root)
WORKSPACE_ROOT = Path(__file__).resolve().parent.parent.parent.parent
ENV_FILE = WORKSPACE_ROOT / ".env"

class Settings(BaseSettings):
    gemini_api_key: str = ""
    gecko_port: int = 8000
    gecko_host: str = "0.0.0.0"
    gecko_simulators_dir: str = "simulators"
    gecko_knowledge_dir: str = "knowledge"
    gecko_language: str = "en"

    model_config = SettingsConfigDict(
        env_file=str(ENV_FILE) if ENV_FILE.exists() else ".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

    @property
    def simulators_path(self) -> Path:
        p = Path(self.gecko_simulators_dir)
        if not p.is_absolute():
            return WORKSPACE_ROOT / p
        return p

    @property
    def knowledge_path(self) -> Path:
        p = Path(self.gecko_knowledge_dir)
        if not p.is_absolute():
            return WORKSPACE_ROOT / p
        return p

settings = Settings()
