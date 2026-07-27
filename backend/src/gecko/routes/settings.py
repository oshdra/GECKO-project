from typing import Any, Dict, Optional
from fastapi import APIRouter
from pydantic import BaseModel

from gecko.config import settings, WORKSPACE_ROOT
from gecko.services import file_io

router = APIRouter(prefix="/api/settings", tags=["settings"])


class UpdateSettingsRequest(BaseModel):
    gemini_api_key: Optional[str] = None
    language: Optional[str] = None
    alias: Optional[str] = None
    avatar_color: Optional[str] = None


@router.get("")
def get_settings() -> Dict[str, Any]:
    """Get current configuration and profile settings."""
    profile = file_io.get_profile()
    # Mask API key if set
    api_key_set = bool(settings.gemini_api_key)
    masked_key = (
        f"{settings.gemini_api_key[:4]}...{settings.gemini_api_key[-4:]}"
        if len(settings.gemini_api_key) > 8
        else ("***" if api_key_set else "")
    )

    try:
        sim_rel = str(settings.simulators_path.relative_to(WORKSPACE_ROOT))
    except ValueError:
        sim_rel = str(settings.simulators_path)

    try:
        know_rel = str(settings.knowledge_path.relative_to(WORKSPACE_ROOT))
    except ValueError:
        know_rel = str(settings.knowledge_path)

    return {
        "gemini_api_key_set": api_key_set,
        "gemini_api_key_masked": masked_key,
        "language": settings.gecko_language,
        "simulators_dir": sim_rel,
        "knowledge_dir": know_rel,
        "profile": profile,
    }


@router.post("")
def update_settings(req: UpdateSettingsRequest) -> Dict[str, Any]:
    """Update settings and user profile."""
    # Update profile fields if provided
    profile_updates = {}
    if req.alias is not None:
        profile_updates["alias"] = req.alias
    if req.avatar_color is not None:
        profile_updates["avatar_color"] = req.avatar_color

    if profile_updates:
        file_io.update_profile(profile_updates)

    # Update in-memory settings
    if req.gemini_api_key is not None:
        settings.gemini_api_key = req.gemini_api_key
    if req.language is not None:
        settings.gecko_language = req.language

    # Save to .env file at root
    env_file = WORKSPACE_ROOT / ".env"
    lines = []
    if env_file.exists():
        lines = env_file.read_text(encoding="utf-8").splitlines()

    env_dict = {}
    for line in lines:
        if "=" in line and not line.strip().startswith("#"):
            k, v = line.split("=", 1)
            env_dict[k.strip()] = v.strip()

    if req.gemini_api_key is not None:
        env_dict["GEMINI_API_KEY"] = req.gemini_api_key
    if req.language is not None:
        env_dict["GECKO_LANGUAGE"] = req.language

    new_env_content = "\n".join(f"{k}={v}" for k, v in env_dict.items()) + "\n"
    env_file.write_text(new_env_content, encoding="utf-8")

    return get_settings()
