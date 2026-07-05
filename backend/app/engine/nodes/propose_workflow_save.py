"""propose_workflow_save — propose a reusable recipe after success (no auto-save)."""
from __future__ import annotations

from app.engine.events import event
from app.engine.helpers import get_workflow_plan
from app.engine.registry import get_store
from app.engine.state import MyceliumState
from app.models.events import EventType


def propose_workflow_save(state: MyceliumState) -> dict:
    plan = get_workflow_plan(state)
    results = state.get("step_results") or []
    if not plan or not any(r.get("ok") for r in results):
        return {"events": []}

    profile = state.get("source_profile") or {}
    store = get_store()
    result_tools = {r.get("step_id"): r.get("tool") for r in results if r.get("tool")}
    steps = []
    for step in plan:
        tool_name = result_tools.get(step.get("id")) or step.get("tool_name") or step.get("tool_query", "unknown")
        for tool in store.list_tools(state.get("pack_id", "data")):
            if tool.name == tool_name or tool.name in str(step.get("tool_query", "")):
                tool_name = tool.name
                break
        steps.append(
            {
                "id": step.get("id", "step"),
                "intent": step.get("intent", ""),
                "tool_name": tool_name,
                "args": step.get("args", {}),
            }
        )

    goal = state.get("goal", "Workflow")
    name = goal[:60] if goal else "Saved workflow"
    proposed = {
        "name": name,
        "description": f"Workflow created from: {goal}",
        "pack_id": state.get("pack_id", "data"),
        "created_from_goal": goal,
        "trigger_profile": {
            "headers": [c["name"] for c in profile.get("columns", [])],
            "semantics": [c.get("semantic_guess") for c in profile.get("columns", []) if c.get("semantic_guess")],
        },
        "steps": steps,
    }
    return {
        "proposed_workflow": proposed,
        "events": [event(EventType.WORKFLOW_PROPOSED, f"Propose workflow: {name}", workflow=proposed)],
    }
