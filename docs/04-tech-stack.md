# 04 — Tech Stack

Chosen for **speed of building in 1 day**, **demo reliability**, and **visual polish** — in that priority order.

---

## Architecture: split frontend + backend

Mycelium is a **Next.js frontend** (the cockpit) talking to a **FastAPI + Python backend** (the agent engine). This is a natural fit: the engine writes and runs **Python** tools, so keeping the orchestration, synthesis, and sandbox all in Python removes any cross-language friction — generated tools execute in the same runtime the engine lives in.

```
[ Next.js cockpit ]  --HTTP/SSE-->  [ FastAPI engine ]  --subprocess-->  [ Python sandbox ]
     (UI panels)        events           (agent loop)         exec            (tool code)
```

---

## Summary

### Backend (engine) — FastAPI + Python

| Layer | Choice | Why |
|---|---|---|
| API framework | **FastAPI** | Async, fast to build, first-class streaming (SSE) for the live event feed; auto docs. |
| Language | **Python 3.11+** | Same runtime as the tools Mycelium writes; rich data ecosystem. |
| Server | **Uvicorn** | Standard ASGI server for FastAPI. |
| Orchestration | **LangGraph** | Models the agent as a stateful graph; conditional edges + loops fit Mycelium's synthesis/self-repair flow; built-in state + streaming. |
| LLM client | **Strong coding model** via its SDK (e.g. `openai`/`anthropic`), used through LangChain chat models | Tool-writing + self-repair quality depends on a top code model. |
| Streaming | **LangGraph stream** → **SSE** (`sse-starlette` / `StreamingResponse`) | Stream graph state/events to the cockpit in real time. |
| Data / tools | **pandas, numpy** | The `data` pack's allowed imports for generated tools. |
| Sandbox | **`subprocess`** (timeout + import allowlist) | Isolate generated code; simple and safe enough for 1 day. |
| Registry | **SQLite** (`sqlite3`/SQLModel) or JSON file (MVP) | Persistence across refresh/sessions = the "memory" demo beat. |
| Validation | **Pydantic** | Typed request/response + event schemas shared conceptually with the UI. |

### Frontend (cockpit) — Next.js

| Layer | Choice | Why |
|---|---|---|
| Framework | **Next.js (App Router)** | Fast to scaffold the 3-panel cockpit; great DX. |
| Language | **TypeScript** | Type-safe UI + typed event models mirroring the Pydantic schemas. |
| Styling | **Tailwind CSS + shadcn/ui** | Polished, consistent UI fast; the track is design-judged. |
| Motion | **Framer Motion** | The materialize/pulse/repair animations that carry the pitch. |
| Code panel | **Monaco Editor** | The live code-writing + diff view (the "money shot"). |
| Streaming client | **EventSource / fetch stream** | Consume the FastAPI SSE event feed into the panels. |
| Charts | lightweight chart lib (e.g. **Recharts**) | Render the `data` pack results (trend chart). |

### Deploy

| Piece | Choice | Why |
|---|---|---|
| Frontend | **Vercel** | Zero-config, instant shareable URL. |
| Backend | **Render / Railway / Fly.io** (or local for judging) | Simple Python hosting; or run locally and demo on `localhost`. |

---

## Detail & reasoning

### Why FastAPI + Python for the engine
- The engine's defining act is **writing and running Python tools**. Keeping the loop in Python means generated tools can be imported/executed directly, and `pandas`/`numpy` are native — no serialization boundary between "the agent" and "the tools it builds."
- FastAPI's **SSE/StreamingResponse** makes the live event feed (reasoning, codegen, repair, reuse) straightforward.
- **Pydantic** models define the event and tool schemas once; the TS side mirrors them.

### Frontend: Next.js + Tailwind + shadcn/ui + Framer Motion
- The cockpit is pure presentation — it renders the event stream from the backend.
- shadcn/ui gives clean cards, panels, and buttons without design overhead.
- Framer Motion is non-negotiable: the create/reuse/repair animations _are_ the argument (see [03 — Design](03-design.md)).

### Live code panel: Monaco
- Renders the synthesized tool being written in real time, error highlighting, and a repair **diff**. This is the most memorable UI element; Monaco gives it for free.

### Orchestration: LangGraph
- Mycelium's control flow **is a graph**: plan → (has tool? → call | synthesize → run → passed? → repair-loop | register → call) → observe → loop. This maps directly onto LangGraph's nodes + conditional edges + cycles.
- **Why LangGraph here:** built-in **state management** and **streaming** feed the live cockpit panels with less plumbing, and the self-repair retry is a natural conditional edge back into the run node.
- **What is still custom (not provided by LangGraph):** the sandbox executor, the codegen/spec/critic prompts, and the **tool registry** (the exportable, compounding library — the demo hero). These are implemented as custom nodes/services; LangGraph orchestrates them.
- The graph is invoked from a FastAPI endpoint; LangGraph's stream is adapted into the SSE event feed.
- **Persistence note:** LangGraph's checkpointer persists *graph run state* — it is **not** the tool registry. The registry (SQLite) is built separately and is what powers "refresh and the library is still there."

### LLM choice
- Use the strongest available **coding** model for the synthesis/repair steps — tool quality and self-repair success rate depend on it.
- Optionally a smaller/faster model for planning/selection to save latency and cost.

### Sandbox: Python subprocess (default)
- Run generated tools in a **separate Python process** with a hard **timeout** and an **import allowlist** from the pack; **no network** for the `data` pack (deterministic demos).
- Captures stdout/stderr/return value as a structured result streamed back to the loop.
- **Why not full container isolation?** Too much setup for 1 day. Subprocess + timeout + allowlist is the right risk/effort tradeoff for a demo.
- **Stretch:** run each tool in a restricted namespace / separate venv, or containerize post-hackathon.

### Registry: SQLite (JSON fallback)
- Stores each tool (name, description, signature, code, packId, usageCount, timestamps).
- Persistence is a **feature**, not an implementation detail — it powers "refresh and the library is still there."
- JSON file is an acceptable MVP shortcut if SQLite setup costs time.

### The `data` capability pack (day-1 pack)
- **Allowed imports:** `pandas`, `numpy` (add `matplotlib`/a chart lib only if rendering server-side; prefer sending data to the frontend chart component).
- **Input adapter:** CSV/Excel upload.
- **Output renderer:** table + chart components on the frontend.
- **Starter tools:** e.g. `load_csv`, `preview_dataframe` (see the demo script for the full starter-vs-built split).

---

## Explicitly out of scope for day 1

- Multi-user auth / accounts.
- Full container/VM sandboxing.
- Additional packs (database, API, documents) — architecture supports them; not built day 1.
- Cross-pack tool sharing and team libraries (vision, not MVP).

---

## Environment / secrets

- **Backend:** LLM API key via environment variable (e.g. `.env`, never committed). Keep `.env.example` documenting required vars.
- **Frontend:** the backend base URL via `NEXT_PUBLIC_API_URL` (e.g. `.env.local`).
- Enable **CORS** on FastAPI for the frontend origin during local dev.
