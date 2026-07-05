"""Capability Pack contracts.

The engine is domain-agnostic (ADR: keep engine generic). All domain-specific
behavior lives in a pack. Adding a new niche = a new pack, engine untouched.
"""
from __future__ import annotations

from typing import Protocol, runtime_checkable

from app.models.tool import Tool


@runtime_checkable
class InputAdapter(Protocol):
    """How a data source is ingested for a pack (CSV upload, DB connection, ...)."""

    def describe_source(self, source_ref: str | None) -> str:
        """Human/LLM-readable description of the connected source for prompts."""
        ...


class CapabilityPack(Protocol):
    id: str
    label: str
    system_prompt: str
    allowed_imports: list[str]
    input_adapter: InputAdapter

    def starter_tools(self) -> list[Tool]:
        """Seed tools the pack begins with (raw plumbing, not the interesting bits)."""
        ...
