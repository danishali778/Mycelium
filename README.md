# Mycelium

> **Every AI agent starts from zero every time. Mycelium is an agent that _remembers what it builds_ — it manufactures its own tools, keeps them, and gets more capable every time you use it.**

Mycelium is a **self-extending agent**. When it hits a task it can't do with the tools it has, it **writes a new tool, tests it in a sandbox, repairs it if it fails, and saves it to a permanent library**. The next time a similar task appears, Mycelium **reuses** that tool instantly instead of re-deriving it. Capability **compounds** over time.

This is the core difference from today's code-interpreter tools: **code interpreter has amnesia; Mycelium has memory.**

---

## Why this exists

Today's agents are amnesiacs. They re-derive the same capabilities on every task and throw the code away. Real autonomy requires an agent that **accumulates** capability. Mycelium is a working proof of self-extending, compounding agents.

Built for the **RaiseSummit Hackathon — Cursor track**, which rewards a thoughtful user journey, strong design/interactivity, and a genuinely better solution to a real problem.

---

## The three pillars

1. **Self-extension** — hits a capability gap, writes its own tool, tests it, and fixes it live.
2. **Persistence** — every tool is saved to a library that survives across tasks and sessions.
3. **Compounding** — the next task reuses existing tools instantly; Mycelium gets faster and cheaper the more it is used.

---

## Documentation

| Doc | What's inside |
|---|---|
| [01 — Overview](docs/01-overview.md) | The problem, the vision, the differentiation, who it's for |
| [02 — Architecture](docs/02-architecture.md) | The generic engine, capability packs, the agent loop, components |
| [03 — Design](docs/03-design.md) | UI/UX, the 3-panel cockpit, visual language, motion, demo choreography |
| [04 — Tech Stack](docs/04-tech-stack.md) | Chosen stack and the reasoning behind each choice |
| [05 — Build Plan](docs/05-build-plan.md) | Hour-by-hour 1-day execution plan and de-risking |
| [06 — Demo Script](docs/06-demo-script.md) | The pitch narrative + the exact scripted demo tasks |
| [Folder Structure](docs/folder_structure.md) | Concrete backend/frontend layout mapped to the architecture |
| [Decision Log](docs/decisions-log.md) | ADR-lite record of **why** each decision was made |

### Project history & collaboration
- [AGENTS.md](AGENTS.md) — rules and guardrails for anyone (agent or human) working on Mycelium.
- [CHANGELOG.md](CHANGELOG.md) — chronological record of what changed.
- [docs/decisions-log.md](docs/decisions-log.md) — the "why" behind decisions.

---

## Status

Concept + documentation phase. Implementation to follow the build plan in [docs/05-build-plan.md](docs/05-build-plan.md).
