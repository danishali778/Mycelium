# 03 — Design (UI / UX)

The Cursor track is judged heavily on design, art, and interactivity. For Mycelium, **the UI _is_ the argument.** The two things that must be beautiful and legible are: (1) the **empty → full tool shelf** and (2) the **live self-repair** of generated code. If those two land, the pitch lands.

---

## Design principle: show the invisible

Normal agents hide their work. Mycelium's entire thesis — self-extension, memory, compounding — is only convincing if you can _see_ it happen. Every internal event is surfaced as a visible, animated moment.

---

## The 3-panel cockpit

```
┌──────────────┬───────────────────────────┬──────────────────┐
│  REASONING   │        WORKSPACE          │   TOOL LIBRARY   │
│  (left)      │        (center)           │   (right)        │
│              │                           │                  │
│ Mycelium's live │  Current step + the       │ Cards for each   │
│ thoughts,    │  LIVE CODE panel:         │ tool. Animate in │
│ plan, ReAct  │  tool being written,      │ on creation.     │
│ steps,       │  run, failing, repaired.  │ Usage counter    │
│ streaming.   │  Then the result          │ ticks up on      │
│              │  (table / chart).         │ reuse. Export    │
│              │                           │ button per card. │
└──────────────┴───────────────────────────┴──────────────────┘
```

### Left — Reasoning stream
- Streams Mycelium's plan and step-by-step reasoning (ReAct).
- Distinct visual treatment for key moments: a **"gap detected"** marker ("I don't have a tool for this — building one") and a **"reuse"** marker ("I already know how to do this").
- Calm, monospace-ish, log-like; auto-scrolls.

### Center — Workspace (the money shot)
- **Live code panel** (Monaco editor, read-only) where the synthesized tool is typed out in real time.
- On failure: the **error is highlighted**, and a **diff** shows what the repair changed. This is the single most impressive moment — give it room to breathe.
- On success: transition to the **result renderer** — a clean table or chart answering the user's question.

### Right — Tool Library shelf
- Each tool is a **card**: name, one-line description, usage count, tiny code preview, export button.
- **Creation:** the card animates in (a "materialize" motion) when a tool is registered.
- **Reuse:** the relevant card **pulses/glows** and its usage counter ticks up. Built-fresh vs. reused have distinct visual signatures.
- Watching this panel fill up over a session _is_ the story of "it's evolving."

---

## Signature interactive moments (invest here)

1. **The empty shelf** at start — "Mycelium knows nothing yet."
2. **Live tool synthesis** — code being written character-by-character in the center panel.
3. **Self-repair** — error highlight → diff → green success. The drama.
4. **Materialize** — a new tool card animating onto the shelf.
5. **Reuse pulse** — an existing card glowing, counter 1→2, with _no_ code being written (proves memory).
6. **Persistence** — after a refresh, the shelf is still full.
7. **Export** — a tool card exports to a `.py` file: "real software, runs without AI."

---

## Visual language

- **Theme:** dark, focused, "cockpit / lab" feel. Mycelium = something quietly intelligent growing in the background.
- **Motif:** a subtle **mycelial network** presence — soft, thread-like/organic ambient motion when Mycelium is thinking; new tools "grow" / "materialize" onto the shelf rather than pop, as if the network is extending.
- **Color roles:**
  - Neutral/base for reasoning and code.
  - One **accent** for _new capability_ (tool created).
  - A distinct **reuse** hue (tool recalled from memory) so build-vs-reuse is instantly readable.
  - Standard error (red) → success (green) transition in the repair loop.
- **Typography:** clean sans for UI chrome; monospace for reasoning + code.
- **Motion:** purposeful, not decorative. Every animation maps to a real event (create, repair, reuse, persist).

---

## Accessibility & legibility for a live demo

- High contrast; large enough code font to read from a projector.
- Key state changes reinforced with text labels, not color alone ("BUILDING NEW TOOL", "REUSED FROM MEMORY").
- Auto-scroll with the ability to pin, so nothing important scrolls off during the pitch.

---

## Demo choreography (how the UI tells the story)

Timed to the pitch in [06 — Demo Script](06-demo-script.md):

1. **Empty shelf** on screen → set the stakes.
2. **Task 1** → reasoning shows "gap detected" → center panel writes code → **error → repair → success** → **card materializes** on the shelf.
3. **Task 2** → reasoning shows "reuse" → **card pulses, counter ticks** → instant result (no code written).
4. **Task 3** → **two tool cards** light up together → combined result. Shelf visibly fuller.
5. **Refresh** → shelf persists.
6. **Export** → `.py` file downloads.

The audience should be able to follow the entire thesis **with the sound off**, just by watching the three panels.
