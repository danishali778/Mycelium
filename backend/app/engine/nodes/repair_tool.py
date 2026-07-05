"""repair_tool — feed errors back to the coder model."""
from __future__ import annotations

from app.engine.events import event
from app.engine.nodes.codegen_tool import _strip_fences
from app.engine.state import MyceliumState
from app.llm import client
from app.models.events import EventType
from app.packs.registry import get_pack


def repair_tool(state: MyceliumState) -> dict:
    name = state["draft_name"]
    code = state["draft_code"]
    error = state.get("last_error", "")
    count = state.get("repair_count", 0) + 1
    pack = get_pack(state.get("pack_id", "data"))

    if client.llm_available():
        prompt = (
            f"The function `{name}` failed:\n{error}\n\nCurrent code:\n{code}\n\n"
            f"Fix it. csv_path must be first param. Return structured dict. "
            f"Allowed imports: {', '.join(pack.allowed_imports)}."
        )
        new_code = _strip_fences(client.complete(prompt, coder=True, system=pack.system_prompt))
    else:
        new_code = code

    return {
        "draft_code": new_code,
        "repair_count": count,
        "events": [
            event(
                EventType.SYNTHESIS_REPAIR,
                f"Repair attempt {count}",
                attempt=count,
                code=new_code,
            )
        ],
    }
