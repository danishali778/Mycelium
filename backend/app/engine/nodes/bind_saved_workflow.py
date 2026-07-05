"""bind_saved_workflow — load a saved workflow into workflow_plan."""
from __future__ import annotations

from app.engine.events import event
from app.engine.state import MyceliumState
from app.engine.workflows import get_workflow_store
from app.models.events import EventType


def bind_saved_workflow(state: MyceliumState) -> dict:
    wf_id = state.get("workflow_id") or state.get("selected_workflow_id")
    if not wf_id:
        return {"events": [event(EventType.ERROR, "No workflow_id provided")]}

    recipe = get_workflow_store().get(wf_id)
    if not recipe:
        return {"events": [event(EventType.ERROR, f"Workflow not found: {wf_id}")]}

    get_workflow_store().increment_usage(wf_id)
    plan = [
        {
            "id": step.id,
            "intent": step.intent,
            "tool_query": step.tool_name,
            "tool_name": step.tool_name,
            "args": step.args,
        }
        for step in recipe.steps
    ]
    first = plan[0] if plan else {}
    return {
        "selected_workflow_id": wf_id,
        "workflow_plan": plan,
        "current_step_index": 0,
        "current_step": first,
        "events": [
            event(
                EventType.PLAN_CREATED,
                f"Loaded workflow '{recipe.name}'",
                workflow_plan=plan,
                workflow_id=wf_id,
            )
        ],
    }


def route_after_profile(state: MyceliumState) -> str:
    if state.get("fatal_error"):
        return "synthesize_result"
    if state.get("workflow_id"):
        return "bind_saved_workflow"
    return "match_workflow"
