"""Source profile contracts — compact CSV summary for the agent."""
from __future__ import annotations

from pydantic import BaseModel


class ColumnProfile(BaseModel):
    name: str
    dtype: str
    null_count: int
    null_ratio: float
    sample_values: list[str] = []
    unique_sample_values: list[str] = []
    dirty_patterns: list[str] = []
    semantic_guess: str | None = None


class SourceProfile(BaseModel):
    source_ref: str
    filename: str
    row_count: int
    column_count: int
    columns: list[ColumnProfile]
    preview_rows: list[dict[str, str]] = []
    warnings: list[str] = []
