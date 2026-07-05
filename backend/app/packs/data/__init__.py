"""Data / spreadsheet analyst pack (the day-1 demo pack, ADR-002)."""
from __future__ import annotations

from app.models.tool import Tool
from app.packs.data.input_adapter import CsvInputAdapter
from app.packs.data.prompt import SYSTEM_PROMPT
from app.packs.data.starter_tools import STARTER_TOOLS


class DataPack:
    id = "data"
    label = "Data Analyst"
    system_prompt = SYSTEM_PROMPT
    allowed_imports = ["pandas", "numpy", "csv", "statistics", "math", "re", "datetime"]
    input_adapter = CsvInputAdapter()

    def starter_tools(self) -> list[Tool]:
        return list(STARTER_TOOLS)
