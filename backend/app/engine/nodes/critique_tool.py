"""critique_tool — validate sandbox result and generated code."""
from __future__ import annotations

from app.config import get_settings
from app.engine.events import event
from app.engine.helpers import code_has_forbidden_patterns, result_is_structured
from app.engine.state import MyceliumState
from app.models.events import EventType


def critique_tool(state: MyceliumState) -> dict:
    code = state.get("draft_code", "")
    run = state.get("draft_run_result") or {}
    name = state.get("draft_name", "")

    if not run.get("ok"):
        err = run.get("error") or run.get("stderr") or "sandbox failed"
        return {
            "last_error": err,
            "events": [event(EventType.SYNTHESIS_ERROR, err, error=err, trace=run.get("stderr"))],
        }

    forbidden = code_has_forbidden_patterns(code, state.get("source_ref"))
    if forbidden:
        return {
            "last_error": forbidden,
            "events": [event(EventType.SYNTHESIS_ERROR, forbidden, error=forbidden)],
        }

    if not result_is_structured(run.get("result_repr", "")):
        err = "Result must be structured dict with ok=True"
        return {
            "last_error": err,
            "events": [event(EventType.SYNTHESIS_ERROR, err, error=err)],
        }

    return {
        "last_error": None,
        "events": [event(EventType.SYNTHESIS_RUN, f"{name} passed critique", ok=True)],
    }


def route_after_critique(state: MyceliumState) -> str:
    if not state.get("last_error"):
        return "register_tool"
    if state.get("repair_count", 0) < get_settings().max_repair_retries:
        return "repair_tool"
    return "observe_step"
