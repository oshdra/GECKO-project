import re
from typing import Any, Dict, List, Optional
from fastapi import APIRouter, HTTPException, Response, status
from fastapi.responses import StreamingResponse
from pydantic import BaseModel


from gecko.services import ai_pipeline, file_io

router = APIRouter(prefix="/api/simulators", tags=["simulators"])


class CreateSimulatorRequest(BaseModel):
    name: str
    domain: str = "general"
    tags: Optional[List[str]] = None
    rendering_library: str = "three.js"
    language: str = "en"
    spec_body: str = ""


class IterateRequest(BaseModel):
    request: str


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


@router.get("/{sim_id}/chat", response_model=List[Dict[str, Any]])
def get_simulator_chat(sim_id: str):
    """Get chat history for a simulator."""
    sim = file_io.get_simulator(sim_id)
    if not sim:
        raise HTTPException(status_code=404, detail=f"Simulator '{sim_id}' not found")
    return file_io.get_simulator_chat(sim_id)


@router.post("/{sim_id}/iterate")
async def iterate_simulator(sim_id: str, req: IterateRequest):
    """Iterate on an existing simulator (SSE endpoint)."""
    sim = file_io.get_simulator(sim_id)
    if not sim:
        raise HTTPException(status_code=404, detail=f"Simulator '{sim_id}' not found")
    if not req.request.strip():
        raise HTTPException(status_code=400, detail="Iteration request cannot be empty")

    return StreamingResponse(
        ai_pipeline.run_iteration_pipeline_sse(sim_id, req.request.strip()),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )


@router.get("/{sim_id}/timeline", response_model=List[Dict[str, Any]])
def get_simulator_timeline(sim_id: str):
    """Get version timeline with diffs for a simulator."""
    sim = file_io.get_simulator(sim_id)
    if not sim:
        raise HTTPException(status_code=404, detail=f"Simulator '{sim_id}' not found")

    versions = sim.get("versions", [])
    chat = sim.get("chat", [])
    frontmatter = sim.get("frontmatter", {})

    timeline = []
    prev_frontmatter = {}

    for idx, v_name in enumerate(versions):
        match = re.search(r"v(\d+)\.html$", v_name)
        ver_num = int(match.group(1)) if match else (idx + 1)

        assistant_msgs = [m for m in chat if m.get("role") == "assistant"]
        summary = "Simulator version creation"
        if idx == 0 and assistant_msgs:
            summary = assistant_msgs[0].get("content", summary)
        elif idx < len(assistant_msgs):
            summary = assistant_msgs[idx].get("content", summary)
        elif assistant_msgs:
            summary = assistant_msgs[-1].get("content", summary)

        curr_fm = dict(frontmatter)
        curr_fm["version"] = ver_num

        diff = compute_frontmatter_diff(prev_frontmatter, curr_fm) if prev_frontmatter else {"added": curr_fm, "changed": {}, "removed": {}}

        timeline.append({
            "version": ver_num,
            "filename": v_name,
            "date": frontmatter.get("modified", frontmatter.get("created", "")),
            "summary": summary,
            "frontmatter": curr_fm,
            "diff": diff,
        })
        prev_frontmatter = curr_fm

    return timeline


def compute_frontmatter_diff(prev: Dict[str, Any], curr: Dict[str, Any]) -> Dict[str, Any]:
    added = {}
    changed = {}
    removed = {}

    for k, v in curr.items():
        if k not in prev:
            added[k] = v
        elif prev[k] != v:
            changed[k] = {"from": prev[k], "to": v}

    for k, v in prev.items():
        if k not in curr:
            removed[k] = v

    return {"added": added, "changed": changed, "removed": removed}

