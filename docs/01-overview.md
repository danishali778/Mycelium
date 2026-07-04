# 01 — Overview

## The one-sentence pitch

> **Every AI agent starts from zero every time. Mycelium is an agent that _remembers what it builds_ — it manufactures its own tools, keeps them, and gets more capable every time you use it.**

---

## The problem

Every AI agent in production today is capped by the tools its developers gave it. When a task falls outside that fixed toolbox, the agent either fails or hallucinates a result.

Even the agents that _can_ write and run code (code interpreters) share a deeper limitation: **amnesia**.

- You ask a question → the agent writes throwaway code → runs it → gives an answer → **the code evaporates.**
- The next task — even a nearly identical one — starts from scratch. The agent re-derives the same logic again and again.
- Nothing accumulates. Task #50 is no easier than task #1.

This is invisible waste. Every developer, analyst, and operator using these tools pays a repeated "re-derivation tax" — the same glue logic (parse this format, clean this column, reshape this data) written over and over, then discarded.

---

## The insight

Real autonomy is not "an agent that can run code once." It's an agent that **accumulates capability over time** — one that learns a skill, keeps it, and reuses it.

An agent should get **better the more you use it**, the way a human specialist builds up a personal toolkit over a career.

---

## The solution: Mycelium

Mycelium is a **self-extending agent**. Its loop has one crucial branch that normal agents don't:

- When Mycelium hits a step it has no tool for, it does not give up. It **synthesizes a new tool**:
  1. Specifies the tool (name, inputs, outputs, description).
  2. Writes the code.
  3. Runs it in a sandbox against a test input.
  4. If it fails, reads the error and **repairs itself** (bounded retries).
  5. Registers the working tool in a **persistent library**.
- The next time a similar step appears, Mycelium **matches and reuses** the existing tool instantly — no rewriting.

The result is an agent whose capability **compounds**. The tool library is inspectable, exportable, and yours — real software Mycelium built and kept, that runs without any LLM.

---

## What makes it different (the wedge)

The novelty is **not** "it writes code." It's **persistence, reuse, and compounding**.

| | Code interpreter (today) | Mycelium |
|---|---|---|
| Memory of what it built | None — code is thrown away | Permanent tool library |
| Second similar task | Rewrites from scratch | Reuses instantly |
| Gets faster over time | No | Yes — compounds |
| Output | Disposable snippets | Curated, exportable toolkit |
| Self-repair | Hidden, ephemeral | First-class, visible loop |

**One-liner:** _"Code interpreter has amnesia. Mycelium has memory."_

### Defusing the obvious objection
"Doesn't ChatGPT / Claude code interpreter already do this?" We answer it head-on: they write **throwaway** code and forget it every time. Mycelium builds a **permanent, inspectable, exportable toolbox that compounds.** Naming and killing this objection on stage turns the biggest weakness into a credibility moment.

---

## Who it's for

- **Primary (demo persona):** a data-savvy operator/analyst who repeatedly wrangles messy files and is tired of re-explaining the same cleanup every time.
- **Broader:** any developer who writes endless throwaway glue scripts.
- **The vision audience:** teams who want a **shared, compounding tool library** where every agent's learning benefits everyone.

---

## Scope for the hackathon (1 day)

- Ship the **generic engine** + **one capability pack** (`data` — a spreadsheet/data analyst).
- Prove all three pillars in a live demo: **build → reuse → compound**, plus **persistence** across a refresh and **export** to a plain Python file.
- Frame the engine as domain-agnostic; additional packs (database, API, documents) are a post-hackathon extension that the architecture already supports.

See [02 — Architecture](02-architecture.md) for how the generic engine and packs are separated, and [06 — Demo Script](06-demo-script.md) for the exact demo flow.

---

## The vision (where it goes)

- **Domain-agnostic engine** — the same self-extension works for databases, APIs, documents, anything, via pluggable capability packs.
- **Cross-task tool sharing** — a tool built during one kind of work becomes available during another. One evolving brain.
- **Team libraries** — capability compounds across people and an entire organization.
