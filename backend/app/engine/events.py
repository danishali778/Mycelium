"""Helpers for emitting engine events and adapting the graph stream to SSE."""
from __future__ import annotations

from collections.abc import Iterator
from typing import Any

from app.models.events import EventType, RunEvent


def event(type_: EventType, message: str = "", **data: Any) -> RunEvent:
    return RunEvent(type=type_, message=message, data=data)


def stream_events(compiled_graph, initial_state: dict) -> Iterator[RunEvent]:
    """Run the compiled graph and yield RunEvents as they are produced.

    Uses LangGraph's `stream` with `stream_mode="values"` and diffs the events
    list so each event is emitted exactly once.
    """
    seen = 0
    for state in compiled_graph.stream(initial_state, stream_mode="values"):
        events: list[RunEvent] = state.get("events", [])
        for ev in events[seen:]:
            yield ev
        seen = len(events)
