"""spec_tool — define a reusable ToolSpec for synthesis."""
from __future__ import annotations

import json

from app.engine.events import event
from app.engine.helpers import get_current_step, parse_json_object, tool_query_from_step
from app.engine.state import MyceliumState
from app.llm import client
from app.models.events import EventType
from app.packs.registry import get_pack


def _mock_spec(step: dict) -> dict:
    query = tool_query_from_step(step).lower()
    args = step.get("args") or {"csv_path": "$source_ref"}
    if "currency" in query or "clean" in query:
        col = args.get("column", "revenue")
        return {
            "name": "clean_currency_column",
            "description": "Clean currency strings in a CSV column",
            "signature": f"clean_currency_column(csv_path: str, column: str) -> dict",
            "parameters": [{"name": "csv_path"}, {"name": "column"}],
            "return_contract": {"ok": True, "summary": str, "data": dict, "artifacts": list},
            "tags": ["csv", "cleaning", "currency"],
            "test_args": {"csv_path": "$source_ref", "column": col},
        }
    if "group" in query or "region" in query:
        return {
            "name": "group_sum_by_column",
            "description": "Group and sum a numeric column by another column",
            "signature": "group_sum_by_column(csv_path: str, value_column: str, group_column: str) -> dict",
            "parameters": [{"name": "csv_path"}, {"name": "value_column"}, {"name": "group_column"}],
            "return_contract": {"ok": True, "summary": str, "data": dict, "artifacts": list},
            "tags": ["csv", "aggregate"],
            "test_args": args,
        }
    return {
        "name": "count_rows",
        "description": "Count rows in a CSV file",
        "signature": "count_rows(csv_path: str) -> dict",
        "parameters": [{"name": "csv_path"}],
        "return_contract": {"ok": True, "summary": str, "data": dict, "artifacts": list},
        "tags": ["csv", "inspect"],
        "test_args": {"csv_path": "$source_ref"},
    }


def spec_tool(state: MyceliumState) -> dict:
    step = get_current_step(state)
    pack = get_pack(state.get("pack_id", "data"))

    if client.llm_available():
        prompt = (
            f"Design ONE reusable CSV tool for this step:\n{json.dumps(step)}\n"
            'Return ONLY JSON with keys: name, description, signature, parameters, return_contract, tags, test_args'
        )
        try:
            raw = client.complete(prompt, coder=True, system=pack.system_prompt)
            spec = parse_json_object(raw)
        except Exception:  # noqa: BLE001
            spec = _mock_spec(step)
    else:
        spec = _mock_spec(step)

    return {
        "draft_tool_spec": spec,
        "draft_name": spec["name"],
        "draft_signature": spec.get("signature", f"{spec['name']}(csv_path: str) -> dict"),
        "draft_description": spec.get("description", ""),
        "repair_count": 0,
        "events": [
            event(
                EventType.SYNTHESIS_SPEC,
                f"Spec: {spec['name']}",
                name=spec["name"],
                signature=spec.get("signature"),
                description=spec.get("description"),
            )
        ],
    }
