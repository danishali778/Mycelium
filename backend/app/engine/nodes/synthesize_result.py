"""synthesize_result — build final answer from step results."""
from __future__ import annotations

from app.engine.events import event
from app.engine.state import MyceliumState
from app.llm import client
from app.models.events import EventType


def synthesize_result(state: MyceliumState) -> dict:
    results = state.get("step_results") or []
    has_existing_answer = bool(state.get("final_answer"))
    if has_existing_answer:
        answer = state["final_answer"]
    elif not results:
        answer = "No step results produced."
    else:
        summaries = [r.get("summary") for r in results if r.get("summary")]
        if client.llm_available() and state.get("goal"):
            prompt = (
                f"Goal: {state['goal']}\nStep results: {results}\n"
                "Summarize the answer in 2-4 sentences for the user."
            )
            try:
                answer = client.complete(prompt)
            except Exception:  # noqa: BLE001
                answer = "\n".join(str(s) for s in summaries) or str(results[-1].get("data"))
        else:
            answer = "\n".join(str(s) for s in summaries) or str(results[-1].get("data"))

    return {
        "final_answer": answer,
        "events": [
            event(
                EventType.RUN_COMPLETED,
                answer if has_existing_answer else "Run complete",
                final_answer=answer,
                step_results=results,
            )
        ],
    }
