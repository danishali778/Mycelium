"""Request/response bodies for the API."""
from __future__ import annotations

from pydantic import BaseModel

from app.models.workflow import WorkflowStep


class RunRequest(BaseModel):
    goal: str = ""
    pack_id: str = "data"
    session_id: str
    source_ref: str | None = None
    source_filename: str | None = None
    workflow_id: str | None = None


class SaveWorkflowRequest(BaseModel):
    name: str
    description: str = ""
    pack_id: str = "data"
    created_from_goal: str
    trigger_profile: dict
    steps: list[WorkflowStep]


class ToolExportResponse(BaseModel):
    filename: str
    code: str
