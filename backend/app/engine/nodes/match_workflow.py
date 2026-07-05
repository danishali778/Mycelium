"""match_workflow — find saved workflow candidates for the current profile."""
from __future__ import annotations

from app.engine.events import event
from app.engine.state import MyceliumState
from app.engine.workflows import get_workflow_store
from app.models.events import EventType


def _score_workflow(trigger: dict, profile: dict) -> float:
    headers = {c["name"].lower() for c in profile.get("columns", [])}
    trigger_headers = {h.lower() for h in trigger.get("headers", [])}
    if not trigger_headers:
        return 0.0
    overlap = len(headers & trigger_headers) / len(trigger_headers)
    semantics = {c.get("semantic_guess") for c in profile.get("columns", []) if c.get("semantic_guess")}
    trigger_sem = set(trigger.get("semantics", []))
    sem_overlap = len(semantics & trigger_sem) / max(len(trigger_sem), 1) if trigger_sem else 0
    return round(0.7 * overlap + 0.3 * sem_overlap, 2)


def match_workflow(state: MyceliumState) -> dict:
    profile = state.get("source_profile") or {}
    store = get_workflow_store()
    candidates = []
    for wf in store.list_workflows(state.get("pack_id", "data")):
        score = _score_workflow(wf.trigger_profile, profile)
        if score > 0.3:
            candidates.append({"workflow_id": wf.id, "name": wf.name, "score": score})
    candidates.sort(key=lambda c: c["score"], reverse=True)
    return {
        "workflow_candidates": candidates,
        "events": [
            event(
                EventType.WORKFLOW_MATCH_CANDIDATES,
                f"Found {len(candidates)} compatible workflow(s)",
                candidates=candidates,
            )
        ],
    }
