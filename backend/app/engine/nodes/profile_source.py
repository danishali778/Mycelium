"""profile_source — profile the connected CSV at run start."""
from __future__ import annotations

from app.engine.events import event
from app.engine.state import MyceliumState
from app.models.events import EventType
from app.packs.data.profiler import profile_csv


def profile_source(state: MyceliumState) -> dict:
    source_ref = state.get("source_ref")
    if not source_ref:
        answer = "Connect a CSV data source before running a workflow."
        return {
            "fatal_error": True,
            "final_answer": answer,
            "events": [
                event(EventType.ERROR, answer, detail="missing source_ref")
            ]
        }

    try:
        profile = profile_csv(source_ref, state.get("source_filename"))
    except Exception as exc:  # noqa: BLE001 - surface profile failures as run events
        answer = f"Could not profile the connected CSV: {exc}"
        return {
            "fatal_error": True,
            "final_answer": answer,
            "events": [event(EventType.ERROR, answer, detail=str(exc))],
        }

    return {
        "fatal_error": False,
        "source_profile": profile.model_dump(),
        "events": [
            event(
                EventType.SOURCE_PROFILED,
                f"Profiled {profile.filename}: {profile.row_count} rows, {profile.column_count} cols",
                profile=profile.model_dump(),
            )
        ],
    }
