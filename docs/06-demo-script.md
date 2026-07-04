# 06 — Demo Script & Pitch

A hackathon is won on the story as much as the code. This is the exact narrative and the scripted tasks. Target: **~3 minutes**, **70% live demo**.

---

## The pitch (verbal spine)

### Open (kill the objection early)
> "Every AI agent starts from zero every time. Even code interpreters — you ask, they write throwaway code, and forget it. They have **amnesia**.
> Mycelium has **memory**. It builds its own tools, keeps them, and gets more capable every time you use it. Let me show you."

### Close (end on vision, not features)
> "Today it's data tasks. The engine is domain-agnostic — the same self-extension works for databases, APIs, anything. Now imagine team libraries, where every agent's learning compounds across a whole organization. Agents that never stop getting better."

---

## The demo arc (beat by beat)

| Beat | Time | What happens | The line |
|---|---|---|---|
| **1. Empty shelf** | 10s | Tool Library panel visibly empty. | "Mycelium knows nothing yet." |
| **2. Build (self-repair)** | 60s | Task 1 → "gap detected" → writes code → **error → repair → success** → card materializes. | "It's writing a tool it doesn't have… it hit an error… and it fixed itself." |
| **3. Reuse** | 30s | Task 2 → "reuse" → card pulses, counter 1→2, **instant** result, no code written. | "It didn't rewrite it. It remembered." |
| **4. Compound** | 30s | Task 3 → two earlier tools light up together → combined result. | "Two skills it taught itself, now working together." |
| **5. Persistence + export** | 20s | Refresh → shelf still full. Export a tool to `.py`. | "These aren't chat snippets. It's real software Mycelium built and kept — it runs without any AI." |
| **6. Vision** | 20s | Land the closing line. | (see close above) |

The audience should follow the whole thesis **with the sound off**, just by watching the panels.

---

## The scripted tasks (chosen so the beats reliably fire)

> Uses a deliberately messy sample CSV so the needed tools are non-trivial but the code is simple enough to succeed within 3 retries. Ship a fixed `sample_sales.csv` with the app.

### Starter tools (Mycelium begins with these)
- `load_csv(path)` — load a file into a dataframe.
- `preview_dataframe(df)` — show head + column types.

### Task 1 — forces a BUILD (with a natural error to repair)
**Prompt:** "What's our total revenue?"
- The `revenue` column is dirty: values like `"$1,200"`, `"(300)"` (parentheses = negative), blanks.
- Mycelium has no cleaning tool → **synthesizes `clean_currency_column`**.
- **Natural first-attempt error:** naive `float()` fails on `$`/commas/parentheses → error surfaces → **repair** handles them → success.
- **Built tool:** `clean_currency_column(col)`. Card materializes.

### Task 2 — forces a REUSE
**Prompt:** "Now show revenue by region."
- Needs the same currency cleaning on the same column → Mycelium **matches and reuses** `clean_currency_column` (counter 1→2), no re-codegen.
- May build one small extra tool (`group_sum(df, by, col)`) if you want a second card — optional.

### Task 3 — COMBINE (optional, if time)
**Prompt:** "Show the monthly revenue trend."
- Dates are in mixed formats → builds/【reuses】 `parse_dates_flexibly`.
- Reuses `clean_currency_column` again → combines with date parsing → renders a **trend chart**.
- Two self-built tools working together.

---

## Rehearsal & fallback checklist

- [ ] Run the full script end-to-end at least 3 times; confirm the build → reuse → combine beats fire.
- [ ] Confirm Task 1 reliably triggers exactly one visible error + repair (tune the sample data so it does).
- [ ] Pre-warm the LLM/session right before presenting.
- [ ] Record a clean screen-capture of a successful run as a **fallback** if live fails.
- [ ] Confirm refresh persistence and export both work on the deploy URL.
- [ ] Have the deploy URL open and the sample CSV ready to upload.

---

## Judging-rubric mapping (say these if asked)

- **Unique / frontier:** self-extending, compounding agents — not a code-interpreter wrapper.
- **Interactivity:** you watch it write, fail, fix, remember, and reuse — live.
- **Design / art:** the empty→full shelf and the self-repair diff are the visual narrative.
- **Real problem:** the "re-derivation tax" every analyst/developer pays; agents that don't accumulate capability.
