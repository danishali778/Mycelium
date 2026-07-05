"""Typed engine events streamed to the cockpit over SSE.

The frontend mirrors these in `frontend/src/lib/types.ts`.
"""
from __future__ import annotations

from enum import Enum
from typing import Any

from pydantic import BaseModel


class EventType(str, Enum):
    SOURCE_PROFILED = "source.profiled"
    WORKFLOW_MATCH_CANDIDATES = "workflow.match_candidates"
    WORKFLOW_PROPOSED = "workflow.proposed"
    WORKFLOW_SAVED = "workflow.saved"
    PLAN_CREATED = "plan.created"
    STEP_STARTED = "step.started"
    TOOL_MATCHED = "tool.matched"  # reuse
    TOOL_GAP_DETECTED = "tool.gap_detected"  # will synthesize
    SYNTHESIS_SPEC = "synthesis.spec"
    SYNTHESIS_CODE = "synthesis.code"
    SYNTHESIS_RUN = "synthesis.run"
    SYNTHESIS_ERROR = "synthesis.error"
    SYNTHESIS_REPAIR = "synthesis.repair"
    SYNTHESIS_REGISTERED = "synthesis.registered"
    TOOL_CALLED = "tool.called"
    STEP_OBSERVED = "step.observed"
    RUN_COMPLETED = "run.completed"
    ERROR = "error"


class RunEvent(BaseModel):
    type: EventType
    message: str = ""
    data: dict[str, Any] = {}

    def to_sse(self) -> dict[str, str]:
        """Shape expected by sse-starlette's EventSourceResponse."""
        return {"event": self.type.value, "data": self.model_dump_json()}
