# Folder Structure

Concrete layout that maps directly to the [architecture](02-architecture.md): a **FastAPI + Python backend** holding the domain-agnostic **engine** and pluggable **capability packs**, and a **Next.js frontend** for the 3-panel **cockpit UI**. Kept flat and pragmatic for a 1-day build.

---

## Top-level

```
RaiseSummit/
├─ README.md
├─ docs/                      # all project documentation (this folder)
├─ backend/                   # FastAPI + Python: the agent engine
├─ frontend/                  # Next.js: the cockpit UI
└─ samples/
   └─ sample_sales.csv        # fixed messy dataset for the demo
```

Two independently runnable apps that talk over HTTP + SSE:

```
[ frontend (Next.js) ]  --HTTP/SSE-->  [ backend (FastAPI) ]  --subprocess-->  [ python sandbox ]
```

---

## `backend/` — FastAPI + Python (the heart)

```
backend/
├─ app/
│  ├─ main.py                 # FastAPI app, CORS, route registration
│  ├─ config.py               # settings (env vars, model names, timeouts)
│  ├─ api/
│  │  ├─ run.py               # POST /run  → SSE stream of engine events
│  │  ├─ upload.py            # POST /upload → ingest CSV via pack adapter
│  │  └─ tools.py             # GET/DELETE /tools, GET /tools/{id}/export (.py)
│  │
│  ├─ engine/                 # domain-agnostic agent core (LangGraph)
│  │  ├─ __init__.py
│  │  ├─ graph.py             # LangGraph StateGraph: nodes + conditional edges
│  │  ├─ state.py             # MyceliumState (typed shared state / TypedDict)
│  │  ├─ nodes/               # graph nodes (the agent's steps)
│  │  │  ├─ __init__.py
│  │  │  ├─ plan.py           # decompose goal into steps
│  │  │  ├─ select.py         # has-tool check / match existing tools (reuse)
│  │  │  ├─ call_tool.py      # run an existing tool
│  │  │  ├─ spec.py           # define name/inputs/outputs/description
│  │  │  ├─ codegen.py        # write the Python tool
│  │  │  ├─ critic.py         # evaluate run result / pass|repair
│  │  │  ├─ repair.py         # feed error back → regenerate (max 3)
│  │  │  ├─ register.py       # persist new tool to registry
│  │  │  └─ observe.py        # record result / continue|end
│  │  ├─ events.py            # map graph stream → SSE events
│  │  ├─ sandbox.py           # subprocess runner: timeout + import allowlist
│  │  └─ registry/
│  │     ├─ __init__.py       # CRUD over the persistent tool store
│  │     ├─ store_sqlite.py   # SQLite implementation
│  │     └─ store_json.py     # JSON fallback for MVP
│  │
│  ├─ packs/                  # capability packs (pluggable niches)
│  │  ├─ base.py              # CapabilityPack / InputAdapter protocols
│  │  ├─ registry.py          # available packs (UI mode selector)
│  │  ├─ data/                # DAY 1 pack: data / spreadsheet analyst
│  │  │  ├─ __init__.py       # pack def (id, label, allowed_imports)
│  │  │  ├─ prompt.py         # system prompt / persona
│  │  │  ├─ starter_tools.py  # load_csv, preview_dataframe
│  │  │  └─ input_adapter.py  # CSV/Excel ingest
│  │  ├─ database/            # LATER (scaffold stub)
│  │  │  └─ __init__.py
│  │  └─ api/                 # LATER (scaffold stub)
│  │     └─ __init__.py
│  │
│  ├─ models/                 # Pydantic schemas
│  │  ├─ events.py            # RunEvent variants (plan, codegen, repair, reuse…)
│  │  ├─ tool.py              # Tool schema (name, code, usage_count, …)
│  │  └─ requests.py          # request/response bodies
│  │
│  └─ llm/
│     └─ client.py            # LLM client config (planning + coding models)
│
├─ sandbox_runner.py          # entrypoint executed as subprocess to run a tool
├─ data/
│  └─ mycelium.db                # SQLite tool registry (persistence)
├─ requirements.txt           # fastapi, uvicorn, pydantic, langgraph, langchain, pandas, numpy, llm sdk
├─ .env.example               # documented env vars (no secrets)
└─ .env                       # local secrets (gitignored)
```

---

## `frontend/` — Next.js cockpit (presentation only)

Renders the event stream from the backend; contains no agent logic.

```
frontend/
├─ src/
│  ├─ app/
│  │  ├─ layout.tsx           # root layout, theme, fonts
│  │  ├─ page.tsx             # the cockpit page (3-panel view)
│  │  └─ globals.css
│  │
│  ├─ components/
│  │  ├─ Cockpit.tsx          # 3-panel layout shell
│  │  ├─ reasoning/
│  │  │  ├─ ReasoningStream.tsx   # left: live thoughts / ReAct steps
│  │  │  └─ EventMarkers.tsx      # "gap detected" / "reused" markers
│  │  ├─ workspace/
│  │  │  ├─ Workspace.tsx         # center container
│  │  │  ├─ LiveCodePanel.tsx     # Monaco: tool written live
│  │  │  ├─ RepairDiff.tsx        # error highlight + repair diff (money shot)
│  │  │  └─ ResultView.tsx        # table / chart of the answer
│  │  ├─ library/
│  │  │  ├─ ToolShelf.tsx         # right: the tool cards
│  │  │  ├─ ToolCard.tsx          # name, desc, usage counter, export
│  │  │  └─ animations.ts         # materialize + reuse-pulse (Framer Motion)
│  │  ├─ input/
│  │  │  ├─ PackSelector.tsx      # choose capability mode
│  │  │  ├─ FileUpload.tsx        # upload the CSV
│  │  │  └─ GoalInput.tsx         # ask the question
│  │  └─ ui/                      # shadcn/ui primitives
│  │
│  └─ lib/
│     ├─ types.ts            # TS event/tool types mirroring Pydantic schemas
│     ├─ stream.ts           # SSE consumer (EventSource / fetch stream)
│     ├─ api.ts              # calls to the FastAPI backend
│     └─ utils.ts            # cn(), formatting, misc
│
├─ package.json
├─ tsconfig.json
├─ tailwind.config.ts
├─ next.config.mjs
└─ .env.local                # NEXT_PUBLIC_API_URL=... (gitignored)
```

---

## Mapping to the architecture

| Architecture concept | Lives in |
|---|---|
| Orchestration graph (LangGraph) | `backend/app/engine/graph.py` + `backend/app/engine/state.py` |
| Graph nodes (plan/select/spec/codegen/critic/repair/register/observe) | `backend/app/engine/nodes/` |
| Tool synthesis subgraph | `nodes/spec.py`, `nodes/codegen.py`, `nodes/critic.py`, `nodes/repair.py` |
| Self-repair | `backend/app/engine/nodes/repair.py` (conditional edge in `graph.py`) |
| Tool Registry (memory) | `backend/app/engine/registry/` + `backend/data/mycelium.db` |
| Tool selection / reuse | `backend/app/engine/nodes/select.py` |
| Sandbox executor | `backend/app/engine/sandbox.py` + `backend/sandbox_runner.py` |
| Event stream | `backend/app/engine/events.py` (graph stream → SSE) → `frontend/src/lib/stream.ts` → UI |
| Capability Pack | `backend/app/packs/<pack>/` |
| 3-panel cockpit | `frontend/src/components/` |

---

## How the two talk

- **`POST /run`** — frontend sends `{ goal, pack_id, session_id }`; backend responds with an **SSE stream** of typed events (`plan.created`, `synthesis.code`, `synthesis.error`, `synthesis.repair`, `tool.registered`, `tool.matched`, `run.completed`, …).
- **`POST /upload`** — frontend uploads the CSV; the pack's input adapter ingests it.
- **`GET /tools`** — frontend loads the persisted tool library on startup (powers "refresh and it's still there").
- **`GET /tools/{id}/export`** — download a tool as a standalone `.py`.
- Event/tool **Pydantic** models in `backend/app/models/` are mirrored by TS types in `frontend/src/lib/types.ts`.

---

## Notes

- **Day-1 focus:** everything under `backend/app/engine/` and `backend/app/packs/data/`, plus the three UI panels in `frontend/`. `database`/`api` packs are scaffold-only stubs to show extensibility.
- **Persistence** lives in `backend/data/mycelium.db` (or a JSON file) — this is what makes the "refresh and the library is still there" beat work.
- Keep `.env` (backend) and `.env.local` (frontend) gitignored; document required keys in `.env.example`.
- Enable **CORS** in `backend/app/main.py` for the frontend origin during local dev.
