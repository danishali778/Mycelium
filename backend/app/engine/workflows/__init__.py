"""Workflow recipe persistence (separate from tool registry)."""
from __future__ import annotations

from app.config import get_settings
from app.models.workflow import WorkflowRecipe

from .store_json import JsonWorkflowStore
from .store_sqlite import SqliteWorkflowStore


class WorkflowStore:
    def list_workflows(self, pack_id: str | None = None) -> list[WorkflowRecipe]: ...
    def get(self, workflow_id: str) -> WorkflowRecipe | None: ...
    def add(self, workflow: WorkflowRecipe) -> WorkflowRecipe: ...
    def increment_usage(self, workflow_id: str) -> None: ...
    def delete(self, workflow_id: str) -> None: ...


def get_workflow_store() -> WorkflowStore:
    settings = get_settings()
    if settings.workflow_backend == "json":
        return JsonWorkflowStore(settings.workflow_path)
    return SqliteWorkflowStore(settings.workflow_path)
