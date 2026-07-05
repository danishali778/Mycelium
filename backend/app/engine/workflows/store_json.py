"""JSON workflow store (MVP fallback)."""
from __future__ import annotations

import json
from pathlib import Path

from app.models.workflow import WorkflowRecipe


class JsonWorkflowStore:
    def __init__(self, path: str) -> None:
        self._path = Path(path).with_suffix(".workflows.json")
        self._path.parent.mkdir(parents=True, exist_ok=True)
        if not self._path.exists():
            self._write([])

    def _read(self) -> list[WorkflowRecipe]:
        return [WorkflowRecipe(**item) for item in json.loads(self._path.read_text() or "[]")]

    def _write(self, items: list[WorkflowRecipe]) -> None:
        self._path.write_text(json.dumps([w.model_dump() for w in items], indent=2))

    def list_workflows(self, pack_id: str | None = None) -> list[WorkflowRecipe]:
        items = self._read()
        if pack_id:
            items = [w for w in items if w.pack_id == pack_id]
        return sorted(items, key=lambda w: w.created_at)

    def get(self, workflow_id: str) -> WorkflowRecipe | None:
        return next((w for w in self._read() if w.id == workflow_id), None)

    def add(self, workflow: WorkflowRecipe) -> WorkflowRecipe:
        items = [w for w in self._read() if w.id != workflow.id]
        items.append(workflow)
        self._write(items)
        return workflow

    def increment_usage(self, workflow_id: str) -> None:
        items = self._read()
        for w in items:
            if w.id == workflow_id:
                w.usage_count += 1
        self._write(items)

    def delete(self, workflow_id: str) -> None:
        self._write([w for w in self._read() if w.id != workflow_id])
