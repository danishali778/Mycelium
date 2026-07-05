"""codegen_tool — write Python code for the specced tool."""
from __future__ import annotations

from app.engine.events import event
from app.engine.state import MyceliumState
from app.llm import client
from app.models.events import EventType
from app.packs.registry import get_pack


def _strip_fences(text: str) -> str:
    text = text.strip()
    if text.startswith("```"):
        lines = text.splitlines()
        lines = lines[1:] if lines and lines[0].startswith("```") else lines
        if lines and lines[-1].strip() == "```":
            lines = lines[:-1]
        text = "\n".join(lines)
    return text.strip() + "\n"


def _mock_code(name: str) -> str:
    if name == "clean_currency_column":
        return (
            "def clean_currency_column(csv_path: str, column: str) -> dict:\n"
            "    import pandas as pd\n"
            "    df = pd.read_csv(csv_path)\n"
            "    raw = df[column].astype(str).str.strip()\n"
            "    negative = raw.str.match(r'^\\(.*\\)$')\n"
            "    cleaned = raw.str.replace(r'[^0-9.\\-]', '', regex=True)\n"
            "    numeric = pd.to_numeric(cleaned, errors='coerce')\n"
            "    df[column] = numeric.mask(negative, -numeric.abs())\n"
            "    return {'ok': True, 'summary': f'Cleaned {column}', 'data': {'column': column}, 'artifacts': []}\n"
        )
    if name == "group_sum_by_column":
        return (
            "def group_sum_by_column(csv_path: str, value_column: str, group_column: str) -> dict:\n"
            "    import pandas as pd\n"
            "    df = pd.read_csv(csv_path)\n"
            "    if not pd.api.types.is_numeric_dtype(df[value_column]):\n"
            "        raw = df[value_column].astype(str).str.strip()\n"
            "        negative = raw.str.match(r'^\\(.*\\)$')\n"
            "        cleaned = raw.str.replace(r'[^0-9.\\-]', '', regex=True)\n"
            "        numeric = pd.to_numeric(cleaned, errors='coerce')\n"
            "        df[value_column] = numeric.mask(negative, -numeric.abs())\n"
            "    grouped = df.groupby(group_column)[value_column].sum().reset_index()\n"
            "    return {'ok': True, 'summary': f'Sum by {group_column}', 'data': grouped.to_dict(orient='records'), 'artifacts': []}\n"
        )
    return (
        f"def {name}(csv_path: str) -> dict:\n"
        f"    import pandas as pd\n"
        f"    df = pd.read_csv(csv_path)\n"
        f"    return {{'ok': True, 'summary': str(len(df)), 'data': {{'rows': len(df)}}, 'artifacts': []}}\n"
    )


def codegen_tool(state: MyceliumState) -> dict:
    spec = state.get("draft_tool_spec") or {}
    name = state["draft_name"]
    signature = state.get("draft_signature", spec.get("signature", f"{name}(csv_path: str) -> dict"))
    description = state.get("draft_description", "")
    pack = get_pack(state.get("pack_id", "data"))

    if client.llm_available():
        prompt = (
            f"Write a single Python function named `{name}`.\n"
            f"Signature: {signature}\nPurpose: {description}\n"
            f"Allowed imports: {', '.join(pack.allowed_imports)}.\n"
            "Must return dict with keys ok, summary, data, artifacts.\n"
            "First parameter must be csv_path. Return ONLY function code."
        )
        try:
            code = _strip_fences(client.complete(prompt, coder=True, system=pack.system_prompt))
        except Exception:  # noqa: BLE001 - keep demo runs alive if the LLM provider fails
            code = _mock_code(name)
    else:
        code = _mock_code(name)

    return {
        "draft_code": code,
        "events": [event(EventType.SYNTHESIS_CODE, f"Wrote {name}", name=name, code=code)],
    }
