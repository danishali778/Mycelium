"""Tool registry endpoints: list, delete, export."""
from __future__ import annotations

from fastapi import APIRouter, HTTPException
from fastapi.responses import PlainTextResponse

from app.engine.registry import get_store
from app.models.tool import Tool
from app.packs.registry import list_packs

router = APIRouter()


@router.get("/packs")
def packs() -> list[dict[str, str]]:
    return list_packs()


@router.get("/tools")
def get_tools(pack_id: str | None = None) -> list[Tool]:
    return get_store().list_tools(pack_id)


@router.delete("/tools/{tool_id}")
def delete_tool(tool_id: str) -> dict[str, bool]:
    get_store().delete(tool_id)
    return {"deleted": True}


@router.get("/tools/{tool_id}/export", response_class=PlainTextResponse)
def export_tool(tool_id: str) -> str:
    tool = get_store().get(tool_id)
    if not tool:
        raise HTTPException(status_code=404, detail="Tool not found")
    header = (
        f'"""{tool.name} — a tool Mycelium built for itself.\n\n'
        f"{tool.description}\nSignature: {tool.signature}\n"
        f'This runs as plain Python, with no LLM required."""\n\n'
    )
    return header + tool.code
