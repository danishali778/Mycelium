"""MyceliumState — shared typed state for the LangGraph graph."""
from __future__ import annotations

import operator
from typing import Annotated, Any, TypedDict

from app.models.events import RunEvent


class MyceliumState(TypedDict, total=False):
    # Inputs
    goal: str
    pack_id: str
    session_id: str
    source_ref: str | None
    source_filename: str | None
    workflow_id: str | None
    fatal_error: bool

    # Source + workflow context
    source_profile: dict
    workflow_candidates: list[dict]
    selected_workflow_id: str | None
    workflow_plan: list[dict]
    current_step_index: int
    current_step: dict

    # Tool synthesis working set
    matched_tool_id: str | None
    draft_tool_spec: dict
    draft_name: str
    draft_signature: str
    draft_description: str
    draft_code: str
    draft_run_result: dict
    last_error: str | None
    repair_count: int

    # Results
    step_results: Annotated[list[dict[str, Any]], operator.add]
    artifacts: Annotated[list[dict[str, Any]], operator.add]
    final_answer: str
    proposed_workflow: dict | None

    # Streaming
    events: Annotated[list[RunEvent], operator.add]
