"""Workflow recipe contracts — reusable multi-step recipes."""
from __future__ import annotations

import time

from pydantic import BaseModel, Field


class WorkflowStep(BaseModel):
    id: str
    intent: str
    tool_name: str
    args: dict
    output_binding: str | None = None


class WorkflowRecipe(BaseModel):
    id: str
    name: str
    description: str
    pack_id: str
    created_from_goal: str
    trigger_profile: dict
    steps: list[WorkflowStep]
    created_at: float = Field(default_factory=time.time)
    usage_count: int = 0
    last_run_at: float | None = None
