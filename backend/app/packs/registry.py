"""Available capability packs (drives the UI mode selector)."""
from __future__ import annotations

from app.packs.base import CapabilityPack
from app.packs.data import DataPack

# Day-1: only the data pack is real. database/api are scaffold stubs.
_PACKS: dict[str, CapabilityPack] = {
    "data": DataPack(),
}


def get_pack(pack_id: str) -> CapabilityPack:
    if pack_id not in _PACKS:
        raise KeyError(f"Unknown pack: {pack_id}")
    return _PACKS[pack_id]


def list_packs() -> list[dict[str, str]]:
    return [{"id": p.id, "label": p.label} for p in _PACKS.values()]
