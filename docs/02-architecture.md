# 02 — Architecture

Mycelium is built as **two layers**: a domain-agnostic **Engine** (built once, never changes) and swappable **Capability Packs** (one per niche). This separation is what makes "extend to new domains later" nearly free.

---

## The two-layer model

### Layer 1 — The Engine (generic, build once)

Knows nothing about spreadsheets, databases, or APIs. It only knows: _goal in → build/use tools → result out._ It is implemented as a **LangGraph state graph** whose nodes are the components below. Components:

- **Orchestration graph (LangGraph)** — a stateful graph modeling the plan/act/observe flow with conditional edges and cycles (including the self-repair loop).
- **Tool Synthesis subgraph** — the defining feature: spec → codegen → sandbox → self-repair → register (custom nodes).
- **Tool Registry** — persistent store of every tool Mycelium has built (custom; **not** the LangGraph checkpointer).
- **Tool Selection / Reuse** — semantic match of a step against existing tools before synthesizing.
- **Sandbox Executor** — runs generated code safely with a timeout and import allowlist (custom node).
- **Event stream** — LangGraph's stream is adapted to SSE; every internal step is emitted to the UI (thoughts, code, errors, repairs, registrations, reuse).

**Division of labor:** LangGraph provides the graph structure, shared state, looping/branching, and streaming. Everything Mycelium-specific — the sandbox, the codegen/spec/critic prompts, and the tool registry — lives in custom nodes that the graph orchestrates.

### Layer 2 — Capability Packs (one per niche, pluggable)

Each pack is a small config bundle that plugs into the engine:

- **Starter tools** — 2–3 seed tools for the domain (e.g. `load_csv`, `preview_dataframe`).
- **Input adapter** — how data enters (file upload for data, connection string for DB, URL for API).
- **System prompt flavor** — persona and domain guidance.
- **Sandbox context** — allowed imports (e.g. `pandas` for data, `sqlite3` for DB).
- **Output renderer** — how results display (tables/charts for data, schema graph for DB).

```
/engine        <- domain-agnostic (build day 1)
   orchestrator, synthesis, registry, sandbox, selection, events
/packs
   /data        <- build day 1  (pandas, CSV upload, chart renderer)
   /database    <- add later    (sqlite3, connection input, schema renderer)
   /api         <- add later    (requests, URL input)
/ui             <- 3 panels, driven by pack config
```

### The Pack interface (Python)

```python
class CapabilityPack(Protocol):
    id: str                    # "data"
    label: str                 # "Data Analyst"
    system_prompt: str         # persona + domain guidance
    starter_tools: list[Tool]  # seed tools
    allowed_imports: list[str] # sandbox allowlist, e.g. ["pandas", "numpy"]
    input_adapter: InputAdapter  # how source data is ingested
    # output rendering lives on the frontend, keyed by pack id
```

Adding a pack = a new config object + 2 seed tools + a renderer. The engine, registry, self-repair, and UI are reused untouched. New packs appear as selectable "modes" in the UI.

---

## The agent loop (detailed)

```
Goal
 └─> Planner: decompose into steps
       └─> For each step: is there a tool for this? (semantic match against registry)
              ├─ YES → call tool  → observe
              └─ NO  → TOOL SYNTHESIS SUBLOOP:
                        1. Spec     : name, inputs, outputs, description
                        2. Codegen  : write the tool as a Python function
                        3. Sandbox  : execute against a test input
                        4. Critic   : did it run? correct shape?
                             ├─ fail → feed error trace back → regenerate (max 3 retries)
                             └─ pass → register in Tool Registry
                        5. Call the new tool → observe
       └─> Observe result → continue until goal met
 └─> Final answer + summary of tools built/reused
```

### Why the synthesis subloop is the heart
This is the branch normal agents lack. The **self-repair** step (feed the error trace back to codegen and try again) is both the most technically meaningful behavior and the most dramatic thing to watch on stage. Cap retries at **3** to keep runs bounded.

### As a LangGraph graph
The loop above is expressed as a LangGraph `StateGraph`:

- **Nodes:** `plan`, `select` (has-tool check), `call_tool`, `spec`, `codegen`, `sandbox_run`, `critic`, `repair`, `register`, `observe`.
- **Conditional edges:**
  - `select` → `call_tool` (tool found) **or** `spec` (gap → synthesize).
  - `critic` → `repair` (failed, `repair_count < 3`) **or** `register` (passed) **or** `observe` (give up after max retries).
  - `repair` → `sandbox_run` (retry cycle).
  - `observe` → `select` (more steps) **or** `END` (goal met).
- **Shared state (`MyceliumState`):** goal, plan/steps, current step, current tool draft, last error, repair_count, results, and the run's tool events. Nodes read/update this typed state.
- **Streaming:** the graph is run with LangGraph streaming; each node transition is mapped to an SSE event for the cockpit.

---

## The Tool Registry (the "memory")

The registry is what makes Mycelium different from a code interpreter. It is a persistent store; each entry (Pydantic model):

```python
class Tool(BaseModel):
    id: str
    name: str                 # e.g. "clean_currency_column"
    description: str          # used for semantic matching
    signature: str            # inputs/outputs
    code: str                 # the Python source
    pack_id: str              # which pack it was born in
    created_at: float
    usage_count: int = 0      # ticks up on every reuse (powers the compounding story)
    last_error: str | None = None  # last failure during synthesis, if any
```

- **Persistence:** stored in SQLite (or a JSON file for the MVP). Survives page refresh and new sessions — this powers the "it remembers" demo beat.
- **Reuse:** before synthesizing, the orchestrator embeds/keyword-matches the step description against `name` + `description` of existing tools. A hit → reuse (increment `usageCount`); a miss → synthesize.
- **Export:** any tool can be written out as a standalone `.py` file — proving it's real software that runs without an LLM.

---

## Data source vs. skills (per-session vs. persistent)

A common misconception: "does Mycelium start from zero every session?" **No.** Two things must be kept separate:

| | What it is | Lifetime |
|---|---|---|
| **Data source** | The input Mycelium *acts on* (a Supabase connection, an uploaded CSV) | **Per session** — provided each time; nothing persists between sessions |
| **Skills (tool library)** | What Mycelium *knows how to do* | **Persistent** — survives across sessions in the registry; grows over time |

So a new session starts fresh on **data**, but **not** on **skills**. To do useful work Mycelium needs a data source to operate on, but it never re-learns capabilities it already has.

### Tools are portable across data sources
A synthesized tool is parameterized (e.g. `list_tables(connection_string)`), so it is **not** bound to the specific data source it was born on. It works on any compatible source:

- **Session 1:** connect DB-A, ask "how many tables?" → Mycelium **builds** `list_tables` (writes + repairs; slow).
- **Session 2 (new day, different DB-B):** connect DB-B, ask "how many tables?" → Mycelium **reuses** `list_tables` instantly — no rebuilding.

The **data** changed completely; the **skill carried over.** This cross-session, cross-source reuse is the compounding that separates Mycelium from a code interpreter (which would rewrite the logic every time).

### Scope note
- Portability is strongest **within a pack** (any Supabase DB reuses any DB-pack tool). Some tools need a data source (`list_tables`); pure transforms (`clean_currency_column(text)`) do not.
- **Cross-pack** tool sharing (a tool built in the data pack reused in the database pack) is a **vision item**, not day-1 scope. For day 1, tools live within the pack they were born in (`pack_id`).

---

## The Sandbox Executor (the risk to contain)

Running LLM-generated code is the biggest safety/complexity item. For a 1-day build the pragmatic choice:

- **Subprocess isolation** — run the tool in a separate Python process.
- **Timeout** — hard kill after N seconds to prevent hangs/infinite loops.
- **Import allowlist** — only the pack's `allowedImports` are permitted.
- **No network by default** in the `data` pack (keeps demos deterministic).
- **Structured result** — stdout/stderr/return value captured and streamed back to the loop and UI.

**Stretch option:** Pyodide (Python compiled to WASM) runs entirely in the browser — no server sandbox needed, and naturally sandboxed. Good if time allows; the subprocess approach is the safe default.

---

## Event stream (how the UI stays live)

The engine emits a typed event for every meaningful step. The UI subscribes and renders in real time. Event types:

- `plan.created`, `step.started`
- `tool.matched` (reuse) / `tool.gap_detected` (will synthesize)
- `synthesis.spec`, `synthesis.code`, `synthesis.run`, `synthesis.error`, `synthesis.repair`, `synthesis.registered`
- `tool.called`, `step.observed`
- `run.completed`

This stream is what powers the reasoning panel, the live code panel, and the animating tool shelf described in [03 — Design](03-design.md).

---

## Data flow (end to end)

1. User selects a pack (`data`) and provides input (uploads a CSV).
2. User states a goal ("what's our monthly revenue trend?").
3. Orchestrator plans steps; for each step it checks the registry.
4. Missing capability → synthesis subloop writes/tests/repairs/register a tool.
5. Tools run in the sandbox; results flow back.
6. Output renderer displays the answer (table/chart); the tool shelf reflects new/reused tools.
7. Registry persists; refresh/export both work.
