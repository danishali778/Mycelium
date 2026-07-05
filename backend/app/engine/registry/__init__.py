"""Tool Registry — Mycelium's persistent memory.

This is the exportable, compounding tool library. It is deliberately separate
from LangGraph's checkpointer (ADR-007): the checkpointer persists graph run
state, this persists the tools themselves.
"""
from __future__ import annotations

from app.config import get_settings
from app.models.tool import Tool

from .store_json import JsonToolStore
from .store_sqlite import SqliteToolStore


class ToolStore:
    """Protocol-ish base for a tool store."""

    def list_tools(self, pack_id: str | None = None) -> list[Tool]: ...
    def get(self, tool_id: str) -> Tool | None: ...
    def add(self, tool: Tool) -> Tool: ...
    def increment_usage(self, tool_id: str) -> None: ...
    def delete(self, tool_id: str) -> None: ...


def get_store() -> ToolStore:
    settings = get_settings()
    if settings.registry_backend == "json":
        return JsonToolStore(settings.registry_path)
    return SqliteToolStore(settings.registry_path)
