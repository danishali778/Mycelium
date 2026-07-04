# 05 — Build Plan (1 Day)

Aggressive but achievable. Priorities in order: **(1) the synthesis + self-repair loop works, (2) reuse/persistence works, (3) the UI sells it.** Everything else is optional.

---

## The one rule of this build

> Spend your best, freshest hours on the **tool-synthesis subloop** (spec → codegen → sandbox → self-repair → register). It is the heart of Mycelium. Everything else is supporting cast.

---

## Hour-by-hour

| Hours | Focus | Outcome |
|---|---|---|
| **0–1** | Scaffold FastAPI backend (SSE `/run`) + Next.js frontend (Tailwind + shadcn); 3-panel layout; wire the SSE event stream end-to-end. | Both apps run; empty cockpit renders; backend can stream events to the left panel. |
| **1–3** | Core ReAct loop + 2–3 built-in starter tools; run one normal task end-to-end. | A task that uses existing tools completes and renders a result. |
| **3–6** | **Tool-synthesis subloop**: spec → codegen → sandbox run → self-repair on error → register. | Mycelium can build a brand-new tool live, fail, fix itself, and succeed. |
| **6–8** | Persistent Tool Registry + reuse via semantic/keyword match. | Second similar task **reuses** the tool instantly; usage counter ticks. |
| **8–10** | UI polish: live Monaco code panel, repair diff, animating tool shelf, reuse pulse. | The build/repair/reuse moments are visually legible and beautiful. |
| **10–12** | Scripted demo tasks (build → reuse → combine), persistence + export, rehearsal, fallbacks. | A rehearsed, deterministic 3-minute demo with a recorded fallback. |

---

## Milestones / definition of done

- **M1 (h3):** A normal task runs end-to-end using starter tools, events stream to the UI.
- **M2 (h6):** Mycelium synthesizes a new tool with at least one self-repair cycle, then uses it.
- **M3 (h8):** Registry persists; a second task reuses an existing tool (no re-codegen).
- **M4 (h10):** All signature moments animate (materialize, repair diff, reuse pulse).
- **M5 (h12):** Full demo script runs deterministically; export works; refresh persists; fallback recording exists.

---

## Risks & de-risking

| Risk | Impact | Mitigation |
|---|---|---|
| Sandbox safety/complexity | High (time sink) | Subprocess + timeout + import allowlist only. No containers. |
| Non-determinism on stage | High | **Pre-pick and rehearse** the exact demo tasks; cache a fallback run/recording. |
| Codegen repeatedly fails | Medium | Cap retries at 3; choose demo tasks whose tools are simple (currency clean, date parse). |
| Scope creep | High | The **reuse** moment matters more than having many tools. One solid build + one reuse > ten fragile tools. |
| LLM latency drags the demo | Medium | Use a fast model for planning; keep tasks small; pre-warm before presenting. |

---

## Cut list (drop these first if behind)

1. Export-to-`.py` (nice, not essential — keep if cheap).
2. Chart rendering (fall back to a clean table).
3. Semantic match (fall back to keyword match on tool name/description).
4. Third "combine" task (a strong build + reuse is enough).

## Never cut (the irreducible demo)

- Empty shelf → build a tool with a visible self-repair → tool card materializes.
- Second task **reuses** the tool instantly (counter ticks).
- Persistence across refresh.
