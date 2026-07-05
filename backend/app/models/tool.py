"""The Tool schema — an entry in the persistent registry (Mycelium's memory)."""
from __future__ import annotations

import time

from pydantic import BaseModel, Field


class Tool(BaseModel):
    id: str
    name: str  # e.g. "clean_currency_column"
    description: str  # used for semantic/keyword matching on reuse
    signature: str  # human-readable inputs/outputs
    code: str  # the Python source of the tool
    pack_id: str  # which pack it was born in
    created_at: float = Field(default_factory=time.time)
    usage_count: int = 0  # ticks up on every reuse (the compounding story)
    last_error: str | None = None  # last failure during synthesis, if any


class ToolDraft(BaseModel):
    """A tool being synthesized, before it is registered."""

    name: str
    description: str
    signature: str
    code: str
    pack_id: str
