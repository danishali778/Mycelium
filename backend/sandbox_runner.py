"""Sandbox subprocess entrypoint.

Reads a JSON payload from stdin, enforces an import allowlist, executes the
provided function, and prints a single JSON result line to stdout.

Invoked by `app/engine/sandbox.py` as: python sandbox_runner.py  (payload via stdin)

NOTE: this is a pragmatic demo-grade sandbox (import allowlist + timeout
enforced by the parent via subprocess). It is NOT a security boundary: generated
code still runs as local Python in a child process. Harden with a container/VM
and strict filesystem policy before any untrusted, multi-user use.
"""
from __future__ import annotations

import builtins
import io
import json
import sys
from contextlib import redirect_stdout


def _safe_builtins(allowed: set[str]):
    real_import = builtins.__import__
    blocked = {"eval", "exec", "compile", "input"}

    def guarded_import(name, globals=None, locals=None, fromlist=(), level=0):
        root = name.split(".")[0]
        if root not in allowed:
            raise ImportError(f"Import of '{name}' is not allowed in the sandbox")
        return real_import(name, globals, locals, fromlist, level)

    safe = {k: v for k, v in vars(builtins).items() if k not in blocked}
    safe["__import__"] = guarded_import
    return safe


def main() -> None:
    payload = json.loads(sys.stdin.read())
    code: str = payload["code"]
    func_name: str = payload["func_name"]
    args: list = payload.get("args", [])
    kwargs: dict = payload.get("kwargs", {})
    allowed = set(payload.get("allowed_imports", [])) | {"math", "json", "re", "datetime"}

    result = {"ok": False, "stdout": "", "stderr": "", "result_repr": "", "error": None}
    buf = io.StringIO()

    sandbox_globals: dict = {
        "__builtins__": _safe_builtins(allowed),
    }

    try:
        with redirect_stdout(buf):
            exec(code, sandbox_globals)  # noqa: S102 - intentional, sandboxed
            if func_name not in sandbox_globals:
                raise NameError(f"Function '{func_name}' not defined by the tool code")
            value = sandbox_globals[func_name](*args, **kwargs)
        result["ok"] = True
        result["result_repr"] = repr(value)
    except Exception as exc:  # noqa: BLE001 - report all failures to the repair loop
        import traceback

        result["error"] = f"{type(exc).__name__}: {exc}"
        result["stderr"] = traceback.format_exc()
    finally:
        result["stdout"] = buf.getvalue()

    print(json.dumps(result))


if __name__ == "__main__":
    main()
