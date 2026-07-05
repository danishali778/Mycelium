"""register_tool — persist a passing tool to the registry."""
from __future__ import annotations

import uuid

from app.engine.events import event
from app.engine.registry import get_store
from app.engine.state import MyceliumState
from app.models.events import EventType
from app.models.tool import Tool


def register_tool(state: MyceliumState) -> dict:
    tool = Tool(
        id=str(uuid.uuid4()),
        name=state["draft_name"],
        description=state.get("draft_description", ""),
        signature=state.get("draft_signature", ""),
        code=state["draft_code"],
        pack_id=state.get("pack_id", "data"),
    )
    get_store().add(tool)
    return {
        "matched_tool_id": tool.id,
        "events": [
            event(
                EventType.SYNTHESIS_REGISTERED,
                f"Registered {tool.name}",
                tool_id=tool.id,
                name=tool.name,
                code=tool.code,
            )
        ],
    }
