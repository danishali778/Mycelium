"""execute_step — run matched tool for the current workflow step."""
from __future__ import annotations

import ast

from app.engine.events import event
from app.engine.helpers import get_current_step, resolve_args
from app.engine.registry import get_store
from app.engine.sandbox import run_tool
from app.engine.state import MyceliumState
from app.models.events import EventType
from app.packs.registry import get_pack


def execute_step(state: MyceliumState) -> dict:
    tool_id = state.get("matched_tool_id")
    tool = get_store().get(tool_id) if tool_id else None
    if not tool:
        return {"events": [event(EventType.ERROR, "No tool to execute")]}

    step = get_current_step(state)
    args_dict = resolve_args(state, step.get("args"))
    positional = [args_dict.pop("csv_path")] if "csv_path" in args_dict else ([state["source_ref"]] if state.get("source_ref") else [])
    pack = get_pack(state.get("pack_id", "data"))
    result = run_tool(tool.code, tool.name, args=positional, kwargs=args_dict, allowed_imports=pack.allowed_imports)

    get_store().increment_usage(tool.id)
    parsed = None
    if result.ok:
        try:
            parsed = ast.literal_eval(result.result_repr)
        except (SyntaxError, ValueError):
            parsed = {"raw": result.result_repr}

    step_result = {
        "step_id": step.get("id"),
        "tool": tool.name,
        "ok": result.ok,
        "summary": parsed.get("summary") if isinstance(parsed, dict) else result.result_repr,
        "data": parsed.get("data") if isinstance(parsed, dict) else {},
        "error": result.error,
    }
    artifacts = parsed.get("artifacts", []) if isinstance(parsed, dict) else []

    return {
        "step_results": [step_result],
        "artifacts": artifacts if isinstance(artifacts, list) else [],
        "events": [
            event(
                EventType.TOOL_CALLED,
                f"Executed {tool.name}",
                step_id=step.get("id"),
                step_intent=step.get("intent"),
                tool_id=tool.id,
                name=tool.name,
                ok=result.ok,
                summary=step_result["summary"],
                data=step_result["data"],
                error=step_result["error"],
                step_result=step_result,
                result=result.result_repr,
            )
        ],
    }
