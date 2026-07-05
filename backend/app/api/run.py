"""POST /run — stream engine events over SSE."""
from __future__ import annotations

import logging

from fastapi import APIRouter
from sse_starlette.sse import EventSourceResponse

from app.engine.events import stream_events
from app.engine.graph import get_compiled_graph
from app.models.requests import RunRequest

router = APIRouter()
logger = logging.getLogger("uvicorn.error")


@router.post("/run")
async def run(request: RunRequest) -> EventSourceResponse:
    logger.info(
        "POST /run received goal=%r source_ref=%s workflow_id=%s",
        request.goal[:120],
        bool(request.source_ref),
        request.workflow_id,
    )
    graph = get_compiled_graph()
    initial_state = {
        "goal": request.goal,
        "pack_id": request.pack_id,
        "session_id": request.session_id,
        "source_ref": request.source_ref,
        "source_filename": request.source_filename,
        "workflow_id": request.workflow_id,
        "current_step_index": 0,
        "repair_count": 0,
        "step_results": [],
        "artifacts": [],
        "events": [],
        "workflow_candidates": [],
    }

    def generator():
        for ev in stream_events(graph, initial_state):
            yield ev.to_sse()

    return EventSourceResponse(generator())
