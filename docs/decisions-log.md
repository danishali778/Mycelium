# Decision Log (ADR-lite)

The **"why"** memory of the project. Each entry records a significant decision so future agents/devs don't silently reverse it. Newest at the top.

> **How to add an entry:** copy the template at the bottom, give it the next number, fill it in, set a status. If you reverse a past decision, don't delete it — add a new entry that supersedes it and mark the old one `Superseded by ADR-XXX`.

---

## ADR-011 — Project name: Mycelium
- **Status:** Accepted
- **Context:** The working name "Ghost" was evocative but didn't communicate what the product does.
- **Decision:** Rename the project to **Mycelium**.
- **Why:** Mycelium (the underground, self-extending, interconnected network of a fungus) captures the core ideas — an intelligence that **grows and extends itself**, whose capability **compounds** through an ever-expanding network, working quietly in the background. It also maps onto the **team-library** vision (a shared network that passes nutrients/skills between nodes).
- **Alternatives rejected:** Ghost (doesn't say what it does), Forge/Skillsmith (toolmaking angle — strong but less unique), Compound (states the thesis but less distinctive/artful).

## ADR-010 — Data source is per-session; skills (tools) persist and are portable
- **Status:** Accepted
- **Context:** Clarifying whether the agent "starts from zero" each session, and how data sources relate to the tool library.
- **Decision:** Treat the **data source** (Supabase connection, uploaded CSV) as **per-session input** that is not persisted, while the **tool library/skills persist** in the registry across sessions. Tools are parameterized (e.g. `list_tables(connection_string)`) so they are **portable across data sources** of the same pack.
- **Why:** This separation is the core of the compounding story — only the data is new each session, never the skills. Portability (build a tool on DB-A, reuse it on DB-B) is what distinguishes Mycelium from a stateless code interpreter.
- **Alternatives rejected:** Binding tools to a specific data source (kills reuse); persisting data sources across sessions (unnecessary, adds state/security scope).
- **Scope note:** Portability is within a pack for day 1; cross-pack tool sharing is a future/vision item.

## ADR-009 — No authentication in scope
- **Status:** Accepted
- **Context:** Considered whether users need accounts/login.
- **Decision:** No auth for the hackathon build. Mycelium is single-user / single-session.
- **Why:** The track is judged on design/interactivity, not account systems. Auth would burn hours for zero demo value. Its absence also removes Supabase's main advantage (see ADR-008).
- **Alternatives rejected:** Supabase Auth, Clerk, NextAuth — all deferred to a future multi-user version.

## ADR-008 — SQLite for persistence (Supabase deferred)
- **Status:** Accepted
- **Context:** The tool registry must persist across refresh/sessions ("memory" is the product). Evaluated SQLite vs. Supabase (hosted Postgres).
- **Decision:** Use **SQLite** (`backend/data/mycelium.db`), with a JSON file as an MVP fallback. Supabase is documented as the future/team-library path.
- **Why:** Zero setup, no network dependency (deterministic demo, resilient to venue wifi), and the registry is a single tiny table read/written by our own backend. Supabase's strengths (auth, multi-user, realtime) are unneeded now — we stream via SSE and have no auth (ADR-009).
- **Alternatives rejected:** Supabase now (adds setup + a network failure point on stage); Postgres locally (heavier than needed).
- **Future:** Move the same schema to Supabase when pursuing team/shared libraries.

## ADR-007 — LangGraph for orchestration
- **Status:** Accepted (supersedes ADR-006)
- **Context:** Team member is comfortable with LangGraph. Mycelium's flow (plan → has-tool? → call | synthesize → run → passed? → repair-loop | register → observe) is a graph with cycles.
- **Decision:** Use **LangGraph** (`StateGraph`) for the engine's control flow, with the LLM SDK used underneath via LangChain chat models.
- **Why:** The flow maps directly to nodes + conditional edges + cycles; built-in state and streaming reduce plumbing for the live cockpit; the self-repair retry is a natural conditional edge.
- **Important boundary:** LangGraph's checkpointer persists *graph run state*, NOT the tool registry. The registry stays custom (ADR-008). Sandbox, codegen/spec/critic prompts, and the registry remain custom nodes.
- **Alternatives rejected:** Custom hand-written loop (ADR-006) — fine, but LangGraph gives streaming/state for free and the flow fits; chosen because the team is already fluent.

## ADR-006 — (Superseded) Custom Python agent loop
- **Status:** Superseded by ADR-007
- **Context:** Before confirming LangGraph familiarity, the plan was a thin custom ReAct loop on the raw LLM SDK.
- **Decision (original):** Hand-write the loop for determinism and minimal abstraction.
- **Why superseded:** Team is comfortable with LangGraph, which fits Mycelium's graph-shaped flow and provides state/streaming out of the box.

## ADR-005 — Split architecture: FastAPI backend + Next.js frontend
- **Status:** Accepted
- **Context:** Team uses FastAPI + Python for backend.
- **Decision:** Python **FastAPI** backend (the engine) + **Next.js** frontend (the cockpit), talking over HTTP + SSE.
- **Why:** Mycelium writes and runs **Python** tools, so keeping the engine + sandbox in Python removes any cross-language boundary between the agent and the tools it builds. FastAPI has first-class SSE for the live event feed.
- **Alternatives rejected:** All-in-one Next.js with a JS/TS engine (would need a separate Python service for tool execution anyway).

## ADR-004 — LLM: provider-agnostic client, free options viable
- **Status:** Accepted
- **Context:** Mycelium makes many LLM calls (codegen + self-repair); cost and flexibility matter.
- **Decision:** Wrap the LLM behind a **provider-agnostic client** (`backend/app/llm/client.py`) selectable via env var. Provider TBD by the team.
- **Why:** Lets us develop for free (Groq/Ollama/Gemini free tiers) and optionally switch to a stronger paid model for the final demo via config only. Tool quality/self-repair success depends on model strength.
- **Alternatives rejected:** Hard-coding a single provider.

## ADR-003 — Persistence & compounding is the hero (positioning)
- **Status:** Accepted
- **Context:** Objection: "code interpreter already writes Python for spreadsheets."
- **Decision:** The hero is the **persistent, compounding, exportable tool library** — "code interpreter has amnesia; Mycelium has memory." The demo must lead with build → reuse → compound + persistence + export.
- **Why:** "Writes code" is not novel; **accumulating and reusing** capability is. This is the defensible wedge and directly answers the obvious objection.
- **Alternatives rejected:** Framing Mycelium as just a data analyst (invites the "ChatGPT does this" comparison).

## ADR-002 — Day-1 niche: the `data` capability pack
- **Status:** Accepted
- **Context:** Engine is domain-agnostic; need one concrete niche to demo.
- **Decision:** Ship the **`data` (spreadsheet/data analyst)** pack for day 1; scaffold `database`/`api` packs as stubs to show extensibility.
- **Why:** Lowest setup, highest demo reliability (no network), strong visual payoff (tables/charts), and relatable pain. Tools are simple enough to synthesize reliably on stage.
- **Alternatives rejected:** Database pack (setup cost), API/web pack (live-network risk) — deferred as future packs.

## ADR-001 — Project concept: Mycelium (self-extending agent)
- **Status:** Accepted
- **Context:** Hackathon Cursor track; wanted a unique, agentic, software-only idea buildable in 1 day. Compared against "Simulacra" (synthetic focus group of agent personas).
- **Decision:** Build **Mycelium** — an agent that manufactures, persists, and reuses its own tools (self-extension + compounding capability).
- **Why:** Frontier concept (not a wrapper), strong visual/interactive story (watch it build, fail, fix, remember), and a real pain (the "re-derivation tax"). Chosen over Simulacra as the stronger, more defensible idea.
- **Alternatives rejected:** Simulacra (kept as backup); earlier "simple pipeline" ideas (dispute desk, grant autopilot, etc.) rejected as too generic.

---

## Template (copy for new decisions)

```
## ADR-0XX — <short title>
- **Status:** Proposed | Accepted | Superseded by ADR-YYY
- **Context:** <what situation/question prompted this>
- **Decision:** <what we decided>
- **Why:** <the reasoning / tradeoffs>
- **Alternatives rejected:** <options considered and why not>
```
