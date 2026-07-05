"""Mycelium backend entrypoint (FastAPI).

Run: uvicorn app.main:app --reload --port 8000
"""
from __future__ import annotations

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import run, tools, upload, workflows
from app.config import get_settings

settings = get_settings()

app = FastAPI(title="Mycelium", version="0.1.0")


def _cors_origins() -> list[str]:
    local_dev_origins = [
        "http://localhost:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001",
    ]
    origins = [settings.frontend_origin, *local_dev_origins]
    return list(dict.fromkeys(origin.rstrip("/") for origin in origins if origin))


app.add_middleware(
    CORSMiddleware,
    allow_origins=_cors_origins(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(run.router, tags=["run"])
app.include_router(upload.router, tags=["upload"])
app.include_router(tools.router, tags=["tools"])

app.include_router(workflows.router, tags=["workflows"])


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok", "service": "mycelium"}
