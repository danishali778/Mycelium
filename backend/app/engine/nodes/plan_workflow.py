"""plan_workflow — structured workflow steps from goal + source profile."""
from __future__ import annotations

import json

from app.engine.events import event
from app.engine.helpers import parse_json_object
from app.engine.registry import get_store
from app.engine.state import MyceliumState
from app.llm import client
from app.models.events import EventType
from app.packs.data.starter_tools import STARTER_TOOLS
from app.packs.registry import get_pack


def _seed_starter_tools() -> None:
    store = get_store()
    existing = {t.name for t in store.list_tools("data")}
    for tool in STARTER_TOOLS:
        if tool.name not in existing:
            store.add(tool)


_VALUE_HINTS = ("revenue", "amount", "price", "cost", "total", "sales")


def _mock_plan(state: MyceliumState) -> list[dict]:
    """Deterministic fallback planner. Goal-aware: picks the value and group
    columns actually mentioned in the goal instead of assuming region."""
    goal = (state.get("goal") or "").lower()
    profile = state.get("source_profile") or {}
    cols = [c["name"] for c in profile.get("columns", [])]

    def mentioned(col: str) -> bool:
        # Match "product", "sales region", "transaction date"... in the goal.
        return col.lower() in goal or col.lower().replace("_", " ") in goal

    value_col = next(
        (c for c in cols if mentioned(c) and any(h in c.lower() for h in _VALUE_HINTS)),
        None,
    ) or next((c for c in cols if any(h in c.lower() for h in _VALUE_HINTS)), "revenue")

    group_col = next(
        (c for c in cols if c != value_col and mentioned(c) and not any(h in c.lower() for h in _VALUE_HINTS)),
        None,
    )
    if group_col is None:
        group_col = next((c for c in cols if "region" in c.lower()), None)

    if group_col and any(k in goal for k in _VALUE_HINTS + ("group", "by", "highest", "top")):
        return [
            {
                "id": "step_1",
                "intent": f"Clean dirty currency values in {value_col}",
                "tool_query": "clean currency column",
                "args": {"csv_path": "$source_ref", "column": value_col},
            },
            {
                "id": "step_2",
                "intent": f"Group {value_col} by {group_col}",
                "tool_query": "group sum by column",
                "args": {
                    "csv_path": "$source_ref",
                    "value_column": value_col,
                    "group_column": group_col,
                },
            },
        ]
    return [
        {
            "id": "step_1",
            "intent": state.get("goal") or "Inspect CSV",
            "tool_query": "count rows csv",
            "args": {"csv_path": "$source_ref"},
        }
    ]


def plan_workflow(state: MyceliumState) -> dict:
    _seed_starter_tools()
    goal = state.get("goal", "")
    pack = get_pack(state.get("pack_id", "data"))
    profile = state.get("source_profile") or {}
    tools = get_store().list_tools(state.get("pack_id", "data"))
    tool_summaries = [{"name": t.name, "description": t.description, "signature": t.signature} for t in tools]

    planner = "llm"
    steps: list[dict] = []
    if client.llm_available() and goal:
        prompt = (
            f"Goal: {goal}\n"
            f"Source profile: {json.dumps(profile, default=str)[:4000]}\n"
            f"Available tools: {json.dumps(tool_summaries)}\n"
            'Return ONLY JSON: {"steps":[{"id":"step_1","intent":"...","tool_query":"...","args":{"csv_path":"$source_ref"}}]}'
        )
        try:
            raw = client.complete(prompt, system=pack.system_prompt)
            data = parse_json_object(raw)
            steps = data.get("steps", [])
        except Exception:  # noqa: BLE001
            planner = "fallback"
    else:
        planner = "fallback" if goal else "workflow"

    if not steps:
        if planner == "llm":
            planner = "fallback"
        steps = _mock_plan(state)

    message = (
        "Planned workflow steps"
        if planner == "llm"
        else "Planned workflow steps (LLM planner unavailable - used fallback heuristics)"
    )
    first = steps[0] if steps else {}
    return {
        "workflow_plan": steps,
        "current_step_index": 0,
        "current_step": first,
        "events": [event(EventType.PLAN_CREATED, message, workflow_plan=steps, planner=planner)],
    }


def route_after_match(state: MyceliumState) -> str:
    return "plan_workflow"
