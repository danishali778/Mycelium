"""Seed tools for the data pack — raw plumbing with csv_path contract."""
from __future__ import annotations

import time

from app.models.tool import Tool

STARTER_TOOLS: list[Tool] = [
    Tool(
        id="starter_load_csv",
        name="load_csv",
        description="Load a CSV file path into a pandas DataFrame.",
        signature="load_csv(csv_path: str) -> dict",
        code=(
            "def load_csv(csv_path: str) -> dict:\n"
            "    import pandas as pd\n"
            "    df = pd.read_csv(csv_path)\n"
            "    return {'ok': True, 'summary': f'{len(df)} rows', 'data': {'rows': len(df)}, 'artifacts': []}\n"
        ),
        pack_id="data",
        created_at=time.time(),
    ),
    Tool(
        id="starter_preview_dataframe",
        name="preview_dataframe",
        description="Return head rows and column dtypes from a CSV.",
        signature="preview_dataframe(csv_path: str) -> dict",
        code=(
            "def preview_dataframe(csv_path: str) -> dict:\n"
            "    import pandas as pd\n"
            "    df = pd.read_csv(csv_path)\n"
            "    return {\n"
            "        'ok': True,\n"
            "        'summary': f'{len(df.columns)} columns',\n"
            "        'data': {'head': df.head().to_dict(orient='records'), 'dtypes': {c: str(t) for c, t in df.dtypes.items()}},\n"
            "        'artifacts': [],\n"
            "    }\n"
        ),
        pack_id="data",
        created_at=time.time(),
    ),
]
