"""observe_step — advance workflow step index."""
from __future__ import annotations

from app.engine.events import event
from app.engine.helpers import get_workflow_plan
from app.engine.state import MyceliumState
from app.models.events import EventType


def observe_step(state: MyceliumState) -> dict:
    idx = state.get("current_step_index", 0) + 1
    plan = get_workflow_plan(state)
    next_step = plan[idx] if idx < len(plan) else {}
    return {
        "current_step_index": idx,
        "current_step": next_step,
        "last_error": None,
        "repair_count": 0,
        "events": [event(EventType.STEP_OBSERVED, "Step observed", next_index=idx)],
    }


def route_after_observe_step(state: MyceliumState) -> str:
    idx = state.get("current_step_index", 0)
    if idx < len(get_workflow_plan(state)):
        return "select_tool"
    return "synthesize_result"
