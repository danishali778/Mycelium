# AGENTS.md

Rules for any agent or developer working on **Mycelium**. Keep this lean — these are guardrails and pointers, not a re-explanation of the project.

---

## 1. Source of truth (anti-drift — read first)

- **Code** is the source of truth for *how it works*. **Docs** are the source of truth for *why*.
- If code and docs conflict, **trust the code and fix the doc in the same change**.
- Read [`docs/decisions-log.md`](docs/decisions-log.md) for *why* things are the way they are. **Do not silently reverse a logged decision** — add a new ADR that supersedes it.
- Treat [`docs/folder_structure.md`](docs/folder_structure.md) and any file/function listings as a **hint, not gospel**. The repo is the truth.

## 2. Context (orient, then read the real docs)

Mycelium is a **self-extending agent**: it writes its own tools, tests them in a sandbox, self-repairs failures, saves them to a persistent library, and reuses them. *Code interpreters have amnesia; Mycelium has memory.*

Start with [`docs/01-overview.md`](docs/01-overview.md) and [`docs/02-architecture.md`](docs/02-architecture.md). Don't restate the project elsewhere — link to these.

## 3. Architecture boundaries (don't break the design)

- Keep the **engine domain-agnostic**. All domain logic goes in a **capability pack** (`backend/app/packs/<pack>/`).
- The **tool registry is custom and separate from LangGraph's checkpointer**. Never conflate them — the registry is the exportable, compounding library (the product hero).
- Tools must be **parameterized and portable** (e.g. `list_tables(connection_string)`), never bound to a specific data source.
- **Data source = per-session input; skills/tools = persistent.** Don't persist data sources; don't reset the tool library per session.

## 4. Scope guardrails (out of scope — do not build)

- **No authentication. No multi-user. No container/VM sandboxing.**
- **SQLite** for persistence (JSON fallback). Supabase is a *future* path only — don't add it now.
- Don't add heavy dependencies without a decision-log entry.
- **Protect the irreducible demo**: empty shelf → build a tool with visible self-repair → tool card materializes → second task **reuses** it → persistence across refresh. Nothing may regress this flow.

## 5. Conventions

- **Backend:** Python 3.11+, FastAPI, **LangGraph** for orchestration, **Pydantic** models for all contracts (events, tools, requests).
- **Frontend:** Next.js + TypeScript, Tailwind + shadcn/ui, **Framer Motion** for the signature animations (materialize / repair diff / reuse pulse), Monaco for the live code panel.
- **Sandbox:** always run generated code via **subprocess + timeout + import allowlist**. Never `exec()` untrusted code in the main process.
- **Contracts live in code:** reference the Pydantic models in `backend/app/models/`; don't duplicate schemas into prose docs.
- Prefer **docstrings/type hints** for behavior over external docs (they update with the code).

## 6. Workflow (keep history alive)

- After a meaningful change → add a dated line to [`CHANGELOG.md`](CHANGELOG.md) under `[Unreleased]`.
- After a design/architecture/tooling decision (or reversing one) → add/update an ADR in [`docs/decisions-log.md`](docs/decisions-log.md).
- When you change structure or stack → update the relevant doc in the same change so it doesn't drift.
- Rule of thumb: **what changed → CHANGELOG; why we chose it → decisions-log; how it's built → the numbered docs.**

## 7. Verification

- Don't claim something works without running it.
- _TODO (fill in once scaffolded): commands to run the backend, run the frontend, and lint/test before declaring a task done._

## 8. Safety & secrets

- Never commit `.env` / secrets. Keys via environment variables only.
- Keep the sandbox's network disabled by default for the `data` pack (deterministic demos).
