"""SQLite implementation of the tool registry (default backend, ADR-008)."""
from __future__ import annotations

import sqlite3
from pathlib import Path

from app.models.tool import Tool

_SCHEMA = """
CREATE TABLE IF NOT EXISTS tools (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    signature TEXT NOT NULL,
    code TEXT NOT NULL,
    pack_id TEXT NOT NULL,
    created_at REAL NOT NULL,
    usage_count INTEGER NOT NULL DEFAULT 0,
    last_error TEXT
);
"""


class SqliteToolStore:
    def __init__(self, path: str) -> None:
        self._path = path
        Path(path).parent.mkdir(parents=True, exist_ok=True)
        with self._conn() as conn:
            conn.executescript(_SCHEMA)

    def _conn(self) -> sqlite3.Connection:
        conn = sqlite3.connect(self._path)
        conn.row_factory = sqlite3.Row
        return conn

    def list_tools(self, pack_id: str | None = None) -> list[Tool]:
        query = "SELECT * FROM tools"
        params: tuple = ()
        if pack_id:
            query += " WHERE pack_id = ?"
            params = (pack_id,)
        query += " ORDER BY created_at ASC"
        with self._conn() as conn:
            rows = conn.execute(query, params).fetchall()
        return [Tool(**dict(row)) for row in rows]

    def get(self, tool_id: str) -> Tool | None:
        with self._conn() as conn:
            row = conn.execute("SELECT * FROM tools WHERE id = ?", (tool_id,)).fetchone()
        return Tool(**dict(row)) if row else None

    def add(self, tool: Tool) -> Tool:
        with self._conn() as conn:
            conn.execute(
                """INSERT OR REPLACE INTO tools
                   (id, name, description, signature, code, pack_id,
                    created_at, usage_count, last_error)
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)""",
                (
                    tool.id, tool.name, tool.description, tool.signature,
                    tool.code, tool.pack_id, tool.created_at,
                    tool.usage_count, tool.last_error,
                ),
            )
            conn.commit()
        return tool

    def increment_usage(self, tool_id: str) -> None:
        with self._conn() as conn:
            conn.execute(
                "UPDATE tools SET usage_count = usage_count + 1 WHERE id = ?",
                (tool_id,),
            )
            conn.commit()

    def delete(self, tool_id: str) -> None:
        with self._conn() as conn:
            conn.execute("DELETE FROM tools WHERE id = ?", (tool_id,))
            conn.commit()
