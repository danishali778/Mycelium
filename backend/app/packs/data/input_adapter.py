"""Input adapter for the data pack: uploaded CSV/Excel files."""
from __future__ import annotations

from pathlib import Path


class CsvInputAdapter:
    def describe_source(self, source_ref: str | None) -> str:
        if not source_ref:
            return "No data source connected yet."
        path = Path(source_ref)
        if not path.exists():
            return f"Referenced file '{source_ref}' was not found."
        return f"A CSV file is available at '{source_ref}'. Tools accept csv_path as first parameter."
