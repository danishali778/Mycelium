# Mycelium

**An agent that remembers what it builds.**

Mycelium is a self-extending AI agent. When it hits a task it has no tool for, it writes one — then tests it in a sandbox, repairs it if it fails, and saves it to a persistent library. The next time a similar task shows up, it reuses that tool instantly instead of rewriting it. The more you use it, the more capable it gets.

> Code interpreters have amnesia. Mycelium has memory.

---

## Why this exists

Every AI agent in production today is capped by the toolbox its developers gave it. When a task falls outside that fixed set of tools, the agent either fails or hallucinates an answer.

Code interpreters (ChatGPT, Claude, etc.) seem to solve this — they can write and run arbitrary code. But they share a deeper limitation: **everything they build is thrown away.**

- You ask a question → the agent writes throwaway code → runs it → answers → **the code evaporates.**
- The next task — even a nearly identical one — starts from scratch. The agent re-derives the same logic again and again.
- Nothing accumulates. Task #50 is no easier than task #1.

This is invisible waste. Anyone who works with messy data pays a repeated "re-derivation tax": the same glue logic — parse this format, clean this column, reshape this data — written over and over, then discarded.

## The idea

Real autonomy isn't "an agent that can run code once." It's an agent that **accumulates capability over time** — the way a human specialist builds up a personal toolkit over a career.

Mycelium's loop has one branch that normal agents don't. When it encounters a step it has no tool for, it:

1. **Specifies** the tool it needs (name, inputs, outputs, description).
2. **Writes** the code.
3. **Tests** it in a sandbox against real input.
4. **Repairs** itself if the test fails — it reads the error and fixes its own code, with bounded retries.
5. **Registers** the working tool in a persistent library.

On the next similar task, Mycelium matches the request against its library and **reuses** the existing tool — no LLM round-trip, no rewriting, no drift. Sequences of tools can be saved as **workflows** and replayed on new files with one click.

The result is a tool library that is inspectable, exportable, and yours: real, parameterized Python that Mycelium built and kept, and that runs without any LLM at all.

|  | Code interpreter | Mycelium |
|---|---|---|
| Memory of what it built | None — code is discarded | Permanent tool library |
| Second similar task | Rewrites from scratch | Reuses instantly |
| Gets better over time | No | Yes — capability compounds |
| Output | Disposable snippets | Curated, exportable toolkit |
| Self-repair | Hidden, ephemeral | First-class, visible in the UI |

## What it looks like in practice

1. **Connect a CSV** and ask for something in plain language — *"Clean the revenue column and summarize total revenue by region."*
2. Mycelium **profiles the file** (columns, types, dirty-data patterns) and plans a workflow.
3. For each step it either **reuses** a library tool (purple badge) or **builds** a new one (teal badge) — you watch the code being written, tested, and repaired live.
4. Results appear as previews under each tool; a run summary answers your question.
5. Save the run as a **workflow recipe**. Upload next week's file, and it replays deterministically.
6. Refresh the page, restart the server — the tools and workflows are still there. Every tool exports as a plain `.py` file.

## Architecture at a glance

```
frontend (Next.js)  ──SSE──►  backend (FastAPI)
                                   │
                            LangGraph engine
              profile → plan → select tool ─┬─ reuse from library
                                            └─ spec → codegen → sandbox test
                                                        ▲          │
                                                        └─ repair ◄┘ (on failure)
                                            → execute → observe → next step
                                            → synthesize answer → propose workflow
                                   │
                     SQLite: tool registry + workflow store
```

Key design decisions:

- **Engine vs. packs.** The orchestration engine is domain-agnostic. All domain knowledge (CSV profiling, prompts, starter tools) lives in a swappable *capability pack*. The shipped pack is `data` (a spreadsheet analyst); database/API/document packs are a natural extension.
- **Tools are parameterized and portable.** A generated tool takes its inputs as arguments (e.g. `clean_currency_column(csv_path, column)`) — it's never bound to one specific file, which is what makes reuse possible.
- **Sandboxed execution.** Generated code never runs in the server process. Every execution goes through a subprocess with a timeout and an import allowlist.
- **Data is per-session, skills are forever.** Uploaded files are transient inputs; the tool library and workflows persist across sessions in SQLite.
- **Works without an LLM key.** With no key configured, the backend falls back to deterministic heuristic planning and template codegen, so the full end-to-end flow still streams for demos and frontend development.

## Tech stack

- **Backend:** Python 3.11+, FastAPI, LangGraph (orchestration), Pydantic (all contracts), SQLite (persistence), server-sent events for streaming.
- **Frontend:** Next.js + TypeScript, Tailwind CSS, Framer Motion (tool-materialize / repair / reuse animations), Monaco-style live code panel.
- **LLM:** provider-agnostic client over any OpenAI-compatible API (OpenRouter, Groq, local Ollama) — configured entirely through environment variables.

## Getting started

### Backend

```bash
cd backend
python -m venv .venv
# Windows: .venv\Scripts\activate    macOS/Linux: source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # add your LLM key here (optional — mock mode works without one)
uvicorn app.main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

Open `http://localhost:3000`. The frontend expects the backend at `http://localhost:8000` unless `NEXT_PUBLIC_API_URL` says otherwise.

### Try it

Sample files live in `samples/`. Connect `sample_sales_comprehensive.csv` (~100 rows with realistic dirty data: currency strings, mixed date formats, missing values) and try, in order:

1. *"Clean the revenue column and summarize total revenue by region"* — watch tools get **built**, tested, and repaired.
2. *"Which product has the highest total revenue after cleaning currency values?"* — watch the same tools get **reused**.
3. Save the workflow, connect `sample_sales_next_week.csv`, and replay it — **compounding**.

## Project layout

```
backend/
  app/engine/          # LangGraph nodes, state, sandbox — domain-agnostic
  app/engine/registry/ # persistent tool library (SQLite / JSON)
  app/engine/workflows/# persistent workflow recipes
  app/packs/data/      # the CSV capability pack (profiler, prompts, starter tools)
  app/models/          # Pydantic contracts: events, tools, workflows, requests
  sandbox_runner.py    # isolated subprocess entrypoint for generated code
frontend/
  src/components/      # workspace, reasoning stream, tool library, workflows UI
  src/context/         # shared cockpit state
samples/               # demo CSVs
```


