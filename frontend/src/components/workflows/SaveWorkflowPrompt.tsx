"use client";

import { useState } from "react";
import { saveWorkflow } from "@/lib/api";
import type { ProposedWorkflow } from "@/lib/types";

export function SaveWorkflowPrompt({
  proposed,
  onSaved,
}: {
  proposed: ProposedWorkflow | null;
  onSaved: () => void;
}) {
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);

  if (!proposed) return null;

  if (saved) {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-success/25 bg-success/[0.06] px-5 py-4 shadow-panel">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-success/15 text-success">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        </span>
        <div>
          <p className="text-sm font-medium text-success">Workflow saved</p>
          <p className="text-xs text-slate-500">
            It now appears in the Workflows tab for one-click reuse.
          </p>
        </div>
      </div>
    );
  }

  async function handleSave() {
    if (!proposed) return;
    setBusy(true);
    try {
      await saveWorkflow({
        name: name.trim() || proposed.name,
        description: proposed.description,
        pack_id: proposed.pack_id,
        created_from_goal: proposed.created_from_goal,
        trigger_profile: proposed.trigger_profile,
        steps: proposed.steps,
      });
      setSaved(true);
      onSaved();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-xl border border-reuse/25 bg-reuse/[0.06] p-5 shadow-panel">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-reuse">
            Save this as a reusable workflow?
          </p>
          <p className="mt-1 text-xs text-slate-500">
            {proposed.steps.length} step{proposed.steps.length === 1 ? "" : "s"}:{" "}
            {proposed.steps
              .map((s) => s.tool_name || s.intent)
              .filter(Boolean)
              .slice(0, 3)
              .join(" -> ")}
          </p>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={proposed.name}
          className="min-w-[220px] flex-1 rounded-lg border border-white/10 bg-base px-3 py-2 text-sm text-slate-200 outline-none placeholder:text-slate-600 focus:border-reuse/40"
        />
        <button
          type="button"
          onClick={handleSave}
          disabled={busy}
          className="rounded-lg bg-reuse px-5 py-2 text-sm font-semibold text-base transition-all hover:bg-reuse/90 disabled:opacity-40"
        >
          {busy ? "Saving..." : "Save workflow"}
        </button>
      </div>
    </div>
  );
}
