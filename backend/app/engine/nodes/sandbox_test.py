"""sandbox_test — run drafted tool in the sandbox."""
from __future__ import annotations

from app.engine.events import event
from app.engine.helpers import resolve_test_args
from app.engine.sandbox import run_tool
from app.engine.state import MyceliumState
from app.models.events import EventType
from app.packs.registry import get_pack


def sandbox_test(state: MyceliumState) -> dict:
    spec = state.get("draft_tool_spec") or {}
    test_args = spec.get("test_args") or state.get("current_step", {}).get("args")
    args, kwargs = resolve_test_args(state, test_args)
    pack = get_pack(state.get("pack_id", "data"))
    result = run_tool(
        code=state["draft_code"],
        func_name=state["draft_name"],
        args=args,
        kwargs=kwargs,
        allowed_imports=pack.allowed_imports,
    )
    return {
        "draft_run_result": result.model_dump(),
        "events": [
            event(
                EventType.SYNTHESIS_RUN,
                f"Ran {state['draft_name']}",
                ok=result.ok,
                stderr=result.stderr,
                result=result.result_repr,
            )
        ],
    }
