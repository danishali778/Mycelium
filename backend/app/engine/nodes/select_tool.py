"""select_tool - match an existing tool or route to synthesis."""
from __future__ import annotations

import re

from app.engine.events import event
from app.engine.helpers import get_current_step, tool_query_from_step
from app.engine.registry import get_store
from app.engine.state import MyceliumState
from app.models.events import EventType

_GENERIC_WORDS = {
    "a",
    "an",
    "and",
    "by",
    "column",
    "columns",
    "csv",
    "data",
    "file",
    "files",
    "for",
    "from",
    "in",
    "of",
    "path",
    "row",
    "rows",
    "the",
    "to",
    "tool",
    "values",
    "with",
}
_SEMANTIC_TASK_WORDS = {
    "aggregate",
    "clean",
    "currency",
    "filter",
    "group",
    "normalize",
    "parse",
    "sum",
}
_RAW_PLUMBING_TOOLS = {"load_csv", "preview_dataframe"}


def _tokens(text: str) -> set[str]:
    words = re.findall(r"[a-zA-Z][a-zA-Z0-9]+", text.replace("_", " ").lower())
    return {word for word in words if len(word) > 2 and word not in _GENERIC_WORDS}


def _tool_tokens(tool) -> set[str]:
    return _tokens(f"{tool.name} {tool.description} {tool.signature}")


def select_tool(state: MyceliumState) -> dict:
    step = get_current_step(state)
    query = tool_query_from_step(step).lower()
    store = get_store()
    tools = store.list_tools(state.get("pack_id", "data"))

    match = None
    requested_tool = step.get("tool_name")
    if requested_tool:
        for tool in tools:
            if tool.name == requested_tool:
                match = tool
                break
        if not match:
            return {
                "matched_tool_id": None,
                "events": [
                    event(
                        EventType.TOOL_GAP_DETECTED,
                        f"Saved workflow tool not found: {requested_tool}",
                        step=step,
                        requested_tool=requested_tool,
                    )
                ],
            }

    query_words = _tokens(query)
    for tool in tools:
        if match:
            break

        # Starter plumbing should not steal semantic cleanup/aggregation tasks.
        if tool.name in _RAW_PLUMBING_TOOLS and query_words & _SEMANTIC_TASK_WORDS:
            continue

        tool_words = _tool_tokens(tool)
        hits = len(query_words & tool_words)
        if not query_words or not hits:
            continue

        if hits == len(query_words) and hits >= 1:
            match = tool
            break
        if hits >= 2 and hits / len(query_words) >= 0.67:
            match = tool
            break

    if match:
        return {
            "matched_tool_id": match.id,
            "events": [
                event(
                    EventType.TOOL_MATCHED,
                    f"Reusing '{match.name}'",
                    tool_id=match.id,
                    name=match.name,
                )
            ],
        }
    return {
        "matched_tool_id": None,
        "events": [
            event(
                EventType.TOOL_GAP_DETECTED,
                f"No tool for: {query or step.get('intent', 'step')}",
                step=step,
            )
        ],
    }


def route_after_select_tool(state: MyceliumState) -> str:
    return "execute_step" if state.get("matched_tool_id") else "spec_tool"
