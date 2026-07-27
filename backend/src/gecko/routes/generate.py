"""API route for AI generation pipeline (SSE streaming)."""

import json
from typing import AsyncIterator
from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

from gecko.services import ai_pipeline

router = APIRouter(prefix="/api", tags=["generate"])


class GenerateRequest(BaseModel):
    concept: str


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
