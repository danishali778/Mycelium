"""Shared helpers for graph nodes."""
from __future__ import annotations

import ast
import json
import re
from typing import Any

from app.engine.state import MyceliumState


def get_workflow_plan(state: MyceliumState) -> list[dict]:
    return state.get("workflow_plan") or []


def get_current_step_index(state: MyceliumState) -> int:
    return state.get("current_step_index", 0)


def get_current_step(state: MyceliumState) -> dict:
    plan = get_workflow_plan(state)
    idx = get_current_step_index(state)
    if idx < len(plan):
        return plan[idx]
    return state.get("current_step") or {}


def resolve_value(state: MyceliumState, value: Any) -> Any:
    if isinstance(value, str) and value == "$source_ref":
        return state.get("source_ref")
    return value


def resolve_args(state: MyceliumState, args: dict | None) -> dict:
    if not args:
        return {"csv_path": state.get("source_ref")} if state.get("source_ref") else {}
    return {k: resolve_value(state, v) for k, v in args.items()}


def resolve_test_args(state: MyceliumState, test_args: dict | None) -> tuple[list, dict]:
    resolved = resolve_args(state, test_args)
    if "csv_path" in resolved:
        positional = [resolved.pop("csv_path")]
        return positional, resolved
    if state.get("source_ref"):
        return [state["source_ref"]], resolved
    return [], resolved


def tool_query_from_step(step: dict) -> str:
    return step.get("tool_query") or step.get("intent") or ""


def parse_json_object(raw: str) -> dict:
    start = raw.find("{")
    end = raw.rfind("}")
    if start == -1 or end == -1:
        raise ValueError("No JSON object found")
    return json.loads(raw[start : end + 1])


def result_is_structured(result_repr: str) -> bool:
    if not result_repr:
        return False
    try:
        value = ast.literal_eval(result_repr)
    except (SyntaxError, ValueError):
        return False
    return isinstance(value, dict) and value.get("ok") is True


def code_has_forbidden_patterns(code: str, source_ref: str | None = None) -> str | None:
    forbidden = [
        "subprocess",
        "socket",
        "requests",
        "shutil",
        "glob",
        "pathlib",
        "os.",
        "data/uploads",
        "data/outputs",
    ]
    if source_ref:
        name = source_ref.replace("\\", "/").split("/")[-1]
        if name and name in code:
            return f"hard-coded filename: {name}"
    for pattern in forbidden:
        if pattern in code:
            return f"forbidden pattern: {pattern}"
    if re.search(r"open\s*\(\s*['\"]([a-zA-Z]:|/|\\\\)", code):
        return "suspicious absolute open() path"
    if "csv_path" not in code and "def " in code:
        return "missing csv_path parameter"
    return None
