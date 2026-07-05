"""JSON-file implementation of the tool registry (MVP fallback, ADR-008)."""
from __future__ import annotations

import json
from pathlib import Path

from app.models.tool import Tool


class JsonToolStore:
    def __init__(self, path: str) -> None:
        self._path = Path(path).with_suffix(".json")
        self._path.parent.mkdir(parents=True, exist_ok=True)
        if not self._path.exists():
            self._write([])

    def _read(self) -> list[Tool]:
        data = json.loads(self._path.read_text() or "[]")
        return [Tool(**item) for item in data]

    def _write(self, tools: list[Tool]) -> None:
        self._path.write_text(json.dumps([t.model_dump() for t in tools], indent=2))

    def list_tools(self, pack_id: str | None = None) -> list[Tool]:
        tools = self._read()
        if pack_id:
            tools = [t for t in tools if t.pack_id == pack_id]
        return sorted(tools, key=lambda t: t.created_at)

    def get(self, tool_id: str) -> Tool | None:
        return next((t for t in self._read() if t.id == tool_id), None)

    def add(self, tool: Tool) -> Tool:
        tools = [t for t in self._read() if t.id != tool.id]
        tools.append(tool)
        self._write(tools)
        return tool

    def increment_usage(self, tool_id: str) -> None:
        tools = self._read()
        for t in tools:
            if t.id == tool_id:
                t.usage_count += 1
        self._write(tools)

    def delete(self, tool_id: str) -> None:
        self._write([t for t in self._read() if t.id != tool_id])
