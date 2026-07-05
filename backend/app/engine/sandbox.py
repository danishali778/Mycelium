"""Sandbox executor — runs LLM-generated tool code in an isolated subprocess.

Safety (ADR: subprocess + timeout + import allowlist):
  - separate Python process (no access to the engine's memory)
  - hard timeout to kill hangs/infinite loops
  - import allowlist enforced by the runner
  - no network by default for the data pack (deterministic demos)
"""
from __future__ import annotations

import json
import subprocess
import sys
from pathlib import Path

from app.config import get_settings
from pydantic import BaseModel

_RUNNER = Path(__file__).resolve().parents[2] / "sandbox_runner.py"


class SandboxResult(BaseModel):
    ok: bool
    stdout: str = ""
    stderr: str = ""
    result_repr: str = ""
    error: str | None = None


def run_tool(
    code: str,
    func_name: str,
    args: list | None = None,
    kwargs: dict | None = None,
    allowed_imports: list[str] | None = None,
) -> SandboxResult:
    """Execute `func_name` from `code` with the given args inside the sandbox."""
    settings = get_settings()
    payload = {
        "code": code,
        "func_name": func_name,
        "args": args or [],
        "kwargs": kwargs or {},
        "allowed_imports": allowed_imports or [],
    }
    try:
        proc = subprocess.run(
            [sys.executable, str(_RUNNER)],
            input=json.dumps(payload),
            capture_output=True,
            text=True,
            timeout=settings.sandbox_timeout_seconds,
        )
    except subprocess.TimeoutExpired:
        return SandboxResult(
            ok=False, error=f"Timed out after {settings.sandbox_timeout_seconds}s"
        )

    # The runner prints a single JSON line on stdout with the structured result.
    try:
        data = json.loads(proc.stdout.strip().splitlines()[-1])
    except (json.JSONDecodeError, IndexError):
        return SandboxResult(
            ok=False, stderr=proc.stderr, error="Could not parse sandbox output"
        )
    return SandboxResult(**data)
