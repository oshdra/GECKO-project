from typing import Any, Dict, List, Optional
from fastapi import APIRouter, HTTPException, Response, status
from pydantic import BaseModel

from gecko.services import file_io

router = APIRouter(prefix="/api/simulators", tags=["simulators"])


class CreateSimulatorRequest(BaseModel):
    name: str
    domain: str = "general"
    tags: Optional[List[str]] = None
    rendering_library: str = "three.js"
    language: str = "en"
    spec_body: str = ""


@router.get("", response_model=List[Dict[str, Any]])
def list_simulators():
    """List all simulators."""
    return file_io.list_simulators()


@router.post("", status_code=status.HTTP_201_CREATED)
def create_simulator(req: CreateSimulatorRequest):
    """Create a new simulator folder + spec.md stub."""
    try:
        result = file_io.create_simulator(
            name=req.name,
            domain=req.domain,
            tags=req.tags,
            rendering_library=req.rendering_library,
            language=req.language,
            spec_body=req.spec_body,
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{sim_id}")
def get_simulator(sim_id: str):
    """Get simulator metadata and spec content."""
    sim = file_io.get_simulator(sim_id)
    if not sim:
        raise HTTPException(status_code=404, detail=f"Simulator '{sim_id}' not found")
    return sim


@router.delete("/{sim_id}")
def delete_simulator(sim_id: str):
    """Delete a simulator folder."""
    success = file_io.delete_simulator(sim_id)
    if not success:
        raise HTTPException(status_code=404, detail=f"Simulator '{sim_id}' not found")
    return {"message": f"Simulator '{sim_id}' deleted successfully"}


@router.get("/{sim_id}/versions", response_model=List[str])
def list_versions(sim_id: str):
    """List HTML versions for a simulator."""
    sim = file_io.get_simulator(sim_id)
    if not sim:
        raise HTTPException(status_code=404, detail=f"Simulator '{sim_id}' not found")
    return sim["versions"]


@router.get("/{sim_id}/html/{version}")
def get_version_html(sim_id: str, version: str):
    """Serve specific HTML version for a simulator."""
    html_content = file_io.get_simulator_html(sim_id, version)
    if html_content is None:
        raise HTTPException(
            status_code=404,
            detail=f"Version '{version}' for simulator '{sim_id}' not found",
        )
    return Response(content=html_content, media_type="text/html")
