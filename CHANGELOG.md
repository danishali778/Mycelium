# Changelog

All notable changes to **Mycelium** are recorded here. Format loosely follows [Keep a Changelog](https://keepachangelog.com/). Newest at the top.

> **How to update:** add a dated, one-line entry under `[Unreleased]` for every meaningful change. Group under `Added` / `Changed` / `Removed` / `Docs`. When decisions are involved, also update [`docs/decisions-log.md`](docs/decisions-log.md).

---

## [Unreleased]

### Docs
- 2026-07-04 — **Renamed the project to Mycelium** (was "Ghost") across all docs; updated `GhostState`→`MyceliumState`, `ghost.db`→`mycelium.db`, and the design motif to a mycelial-network theme (ADR-011).
- 2026-07-04 — Added `AGENTS.md`: lean, guardrail-focused rules with an anti-drift source-of-truth hierarchy (code = how, docs = why).
- 2026-07-04 — Documented the **data-source-per-session vs. persistent-portable-skills** model in `02-architecture.md` (new section) and `decisions-log.md` (ADR-010).
- 2026-07-04 — Added project history system: `AGENTS.md` (agent entry point + process rules), `docs/decisions-log.md` (ADR-lite, backfilled with ADR-001..009), and this `CHANGELOG.md`.
- 2026-07-04 — Confirmed **no auth** in scope; documented **SQLite** as persistence with **Supabase** as the future team-library path (ADR-008, ADR-009).
- 2026-07-04 — Switched orchestration to **LangGraph** across `02-architecture.md`, `04-tech-stack.md`, `folder_structure.md`; noted registry stays custom vs. LangGraph checkpointer (ADR-007, supersedes ADR-006).
- 2026-07-04 — Adopted **FastAPI + Python backend / Next.js frontend** split; updated tech-stack and folder structure; converted interface snippets to Python/Pydantic (ADR-005).
- 2026-07-04 — Added `docs/folder_structure.md` mapping the architecture to a concrete layout.
- 2026-07-04 — Authored initial documentation set: `README.md`, `01-overview`, `02-architecture`, `03-design`, `04-tech-stack`, `05-build-plan`, `06-demo-script`.
- 2026-07-04 — Locked concept **Mycelium** (self-extending agent) with the `data` capability pack for the day-1 demo (ADR-001, ADR-002, ADR-003).

### Added
- _(nothing implemented yet — planning/documentation phase)_

---

## Status

**Phase:** Documentation & planning complete. Implementation pending per [`docs/05-build-plan.md`](docs/05-build-plan.md).
