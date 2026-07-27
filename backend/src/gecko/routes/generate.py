"""API route for AI generation pipeline (SSE streaming)."""

import json
from typing import Any, AsyncIterator, Dict, Optional
from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

from gecko.services import ai_pipeline

router = APIRouter(prefix="/api", tags=["generate"])


class GenerateRequest(BaseModel):
    concept: str


class ExecuteRequest(BaseModel):
    proposal: Dict[str, Any]
    concept: Optional[str] = None


async def sse_generator(concept: str) -> AsyncIterator[str]:
    """Generate Server-Sent Events stream for AI pipeline Step 1."""
    try:
        # Step 1: Running event
        start_event = {
            "step": 1,
            "status": "running",
            "message": f"Analyzing concept: '{concept}'...",
        }
        yield f"data: {json.dumps(start_event)}\n\n"

        # Execute Step 1 Concept Modeling
        proposal = await ai_pipeline.step1_concept_modeling(concept)

        # Step 1: Done event
        done_event = {
            "step": 1,
            "status": "done",
            "proposal": proposal,
        }
        yield f"data: {json.dumps(done_event)}\n\n"

    except Exception as e:
        error_event = {
            "step": 1,
            "status": "error",
            "error": str(e),
        }
        yield f"data: {json.dumps(error_event)}\n\n"


async def sse_execute_generator(proposal: Dict[str, Any], concept: Optional[str] = None) -> AsyncIterator[str]:
    """Generate Server-Sent Events stream for AI pipeline Steps 2-4."""
    try:
        # Step 2: Visualization Design
        yield f"data: {json.dumps({'step': 2, 'status': 'running', 'message': 'Designing visualization layout...'})}\n\n"
        viz_plan = await ai_pipeline.step2_visualization_design(proposal)
        yield f"data: {json.dumps({'step': 2, 'status': 'done', 'viz_plan': viz_plan})}\n\n"

        # Step 3: Physics & Logic Model
        yield f"data: {json.dumps({'step': 3, 'status': 'running', 'message': 'Modeling physics & equations...'})}\n\n"
        physics_model = await ai_pipeline.step3_physics_model(proposal, viz_plan)
        yield f"data: {json.dumps({'step': 3, 'status': 'done', 'physics_model': physics_model})}\n\n"

        # Step 4: HTML Generation & Assembly
        yield f"data: {json.dumps({'step': 4, 'status': 'running', 'message': 'Generating HTML code & spec...'})}\n\n"
        raw_html = await ai_pipeline.step4_html_generation(proposal, viz_plan, physics_model)
        sim_meta = ai_pipeline.assemble_and_save_simulator(proposal, viz_plan, physics_model, raw_html)
        yield f"data: {json.dumps({'step': 4, 'status': 'done', 'simulator_id': sim_meta['id'], 'version': sim_meta['version']})}\n\n"

    except Exception as e:
        yield f"data: {json.dumps({'step': 4, 'status': 'error', 'error': str(e)})}\n\n"


@router.post("/generate")
async def generate_proposal(req: GenerateRequest):
    """Start concept proposal generation pipeline (SSE endpoint)."""
    concept = req.concept.strip()
    if not concept:
        raise HTTPException(status_code=400, detail="Concept string cannot be empty")

    return StreamingResponse(
        sse_generator(concept),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )


@router.post("/generate/execute")
async def execute_generation(req: ExecuteRequest):
    """Execute Steps 2-4 of generation pipeline for an approved proposal (SSE endpoint)."""
    if not req.proposal:
        raise HTTPException(status_code=400, detail="Proposal object is required")

    return StreamingResponse(
        sse_execute_generator(req.proposal, req.concept),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )

