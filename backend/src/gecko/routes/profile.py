from typing import Any, Dict, Optional
from fastapi import APIRouter
from pydantic import BaseModel

from gecko.services import file_io

router = APIRouter(prefix="/api/profile", tags=["profile"])


class ProfileUpdateRequest(BaseModel):
    alias: Optional[str] = None
    avatar_color: Optional[str] = None
    language: Optional[str] = None


@router.get("", response_model=Dict[str, Any])
def get_profile():
    """Get local user profile from ~/.gecko/profile.json."""
    return file_io.get_profile()


@router.post("", response_model=Dict[str, Any])
def update_profile(req: ProfileUpdateRequest):
    """Update local user profile in ~/.gecko/profile.json."""
    data = req.model_dump(exclude_unset=True)
    return file_io.update_profile(data)
