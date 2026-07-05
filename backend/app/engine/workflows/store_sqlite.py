"""SQLite workflow store."""
from __future__ import annotations

import json
import sqlite3
import time
from pathlib import Path

from app.models.workflow import WorkflowRecipe, WorkflowStep

_SCHEMA = """
CREATE TABLE IF NOT EXISTS workflows (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    pack_id TEXT NOT NULL,
    created_from_goal TEXT NOT NULL,
    trigger_profile TEXT NOT NULL,
    steps TEXT NOT NULL,
    created_at REAL NOT NULL,
    usage_count INTEGER NOT NULL DEFAULT 0,
    last_run_at REAL
);
"""


class SqliteWorkflowStore:
    def __init__(self, path: str) -> None:
        self._path = path
        Path(path).parent.mkdir(parents=True, exist_ok=True)
        with self._conn() as conn:
            conn.executescript(_SCHEMA)

    def _conn(self) -> sqlite3.Connection:
        conn = sqlite3.connect(self._path)
        conn.row_factory = sqlite3.Row
        return conn

    def _row_to_recipe(self, row: sqlite3.Row) -> WorkflowRecipe:
        return WorkflowRecipe(
            id=row["id"],
            name=row["name"],
            description=row["description"],
            pack_id=row["pack_id"],
            created_from_goal=row["created_from_goal"],
            trigger_profile=json.loads(row["trigger_profile"]),
            steps=[WorkflowStep(**s) for s in json.loads(row["steps"])],
            created_at=row["created_at"],
            usage_count=row["usage_count"],
            last_run_at=row["last_run_at"],
        )

    def list_workflows(self, pack_id: str | None = None) -> list[WorkflowRecipe]:
        query = "SELECT * FROM workflows"
        params: tuple = ()
        if pack_id:
            query += " WHERE pack_id = ?"
            params = (pack_id,)
        query += " ORDER BY created_at ASC"
        with self._conn() as conn:
            rows = conn.execute(query, params).fetchall()
        return [self._row_to_recipe(r) for r in rows]

    def get(self, workflow_id: str) -> WorkflowRecipe | None:
        with self._conn() as conn:
            row = conn.execute("SELECT * FROM workflows WHERE id = ?", (workflow_id,)).fetchone()
        return self._row_to_recipe(row) if row else None

    def add(self, workflow: WorkflowRecipe) -> WorkflowRecipe:
        with self._conn() as conn:
            conn.execute(
                """INSERT OR REPLACE INTO workflows
                   (id, name, description, pack_id, created_from_goal, trigger_profile,
                    steps, created_at, usage_count, last_run_at)
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
                (
                    workflow.id,
                    workflow.name,
                    workflow.description,
                    workflow.pack_id,
                    workflow.created_from_goal,
                    json.dumps(workflow.trigger_profile),
                    json.dumps([s.model_dump() for s in workflow.steps]),
                    workflow.created_at,
                    workflow.usage_count,
                    workflow.last_run_at,
                ),
            )
            conn.commit()
        return workflow

    def increment_usage(self, workflow_id: str) -> None:
        with self._conn() as conn:
            conn.execute(
                "UPDATE workflows SET usage_count = usage_count + 1, last_run_at = ? WHERE id = ?",
                (time.time(), workflow_id),
            )
            conn.commit()

    def delete(self, workflow_id: str) -> None:
        with self._conn() as conn:
            conn.execute("DELETE FROM workflows WHERE id = ?", (workflow_id,))
            conn.commit()
