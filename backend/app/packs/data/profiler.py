"""Deterministic CSV profiler for the data pack."""
from __future__ import annotations

import csv
import re
from pathlib import Path

import pandas as pd

from app.models.source import ColumnProfile, SourceProfile

DIRTY_CHECKS = {
    "currency_symbols": re.compile(r"[$€£¥]"),
    "commas_in_numbers": re.compile(r"\d,\d"),
    "parentheses_negative": re.compile(r"\(\s*\d"),
    "mixed_date_formats": re.compile(r"\d{1,2}[/-]\d{1,2}[/-]\d{2,4}|\d{4}-\d{2}-\d{2}"),
    "percent_strings": re.compile(r"\d+\s*%"),
    "blank_values": re.compile(r"^\s*$"),
    "boolean_like_strings": re.compile(r"^(true|false|yes|no|y|n)$", re.I),
}

_SAMPLE_ROWS = 1000


def _semantic_guess(name: str) -> str | None:
    lower = name.lower()
    if any(k in lower for k in ("date", "created", "time")):
        return "date"
    if any(k in lower for k in ("revenue", "amount", "price", "cost", "total")):
        return "currency_amount"
    if any(k in lower for k in ("region", "country", "state", "city")):
        return "region"
    if "status" in lower:
        return "status"
    if any(k in lower for k in ("product", "sku", "item")):
        return "product"
    if "email" in lower:
        return "email"
    return None


def _detect_dirty(values: list[str]) -> list[str]:
    found: list[str] = []
    for label, pattern in DIRTY_CHECKS.items():
        if any(pattern.search(v) for v in values if v):
            found.append(label)
    return found


def _count_csv_rows(path: Path) -> int:
    with path.open("r", encoding="utf-8", errors="replace", newline="") as handle:
        reader = csv.reader(handle)
        try:
            next(reader)
        except StopIteration:
            return 0
        return sum(1 for _ in reader)


def profile_csv(source_ref: str, filename: str | None = None) -> SourceProfile:
    path = Path(source_ref)
    if not path.exists():
        raise FileNotFoundError(f"CSV not found: {source_ref}")

    row_count = _count_csv_rows(path)
    df = pd.read_csv(path, nrows=_SAMPLE_ROWS)
    columns: list[ColumnProfile] = []

    for col in df.columns:
        series = df[col]
        null_count = int(series.isna().sum())
        sampled_rows = len(series)
        null_ratio = null_count / sampled_rows if sampled_rows else 0.0
        sample = [str(v) for v in series.dropna().head(5).tolist()]
        unique_sample = [str(v) for v in series.dropna().astype(str).unique()[:5].tolist()]
        dirty = _detect_dirty(sample + unique_sample)
        if null_count:
            dirty.append("blank_values")
        columns.append(
            ColumnProfile(
                name=str(col),
                dtype=str(series.dtype),
                null_count=null_count,
                null_ratio=round(null_ratio, 4),
                sample_values=sample,
                unique_sample_values=unique_sample,
                dirty_patterns=sorted(set(dirty)),
                semantic_guess=_semantic_guess(str(col)),
            )
        )

    preview = df.head(5).fillna("").astype(str).to_dict(orient="records")
    warnings: list[str] = []
    if row_count > 10000:
        warnings.append("Large file; agent sees profile summary only.")
    if row_count > _SAMPLE_ROWS:
        warnings.append(f"Column stats are based on the first {_SAMPLE_ROWS} rows.")

    return SourceProfile(
        source_ref=str(path),
        filename=filename or path.name,
        row_count=row_count,
        column_count=len(columns),
        columns=columns,
        preview_rows=preview,
        warnings=warnings,
    )
