"use client";

import { useMemo } from "react";
import type { Tool, WorkflowRecipe } from "@/lib/types";

interface TimelineEntry {
  id: string;
  label: string;
  detail: string;
  ts: number;
  kind: "create" | "reuse" | "workflow";
}

function formatWhen(ts: number) {
  const d = new Date(ts * 1000);
  const now = new Date();
  const sameDay =
    d.getDate() === now.getDate() &&
    d.getMonth() === now.getMonth() &&
    d.getFullYear() === now.getFullYear();
  if (sameDay) return "Today";
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (
    d.getDate() === yesterday.getDate() &&
    d.getMonth() === yesterday.getMonth() &&
    d.getFullYear() === yesterday.getFullYear()
  ) {
    return "Yesterday";
  }
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function MemoryTimeline({
  tools,
  workflows,
}: {
  tools: Tool[];
  workflows: WorkflowRecipe[];
}) {
  const entries = useMemo(() => {
    const list: TimelineEntry[] = [];

    for (const t of tools) {
      list.push({
        id: `tool-${t.id}`,
        label: formatWhen(t.created_at),
        detail:
          t.usage_count > 1
            ? `${t.name} reused (${t.usage_count}x)`
            : `${t.name} created`,
        ts: t.created_at,
        kind: t.usage_count > 1 ? "reuse" : "create",
      });
    }

    for (const w of workflows) {
      list.push({
        id: `wf-${w.id}`,
        label: formatWhen(w.created_at),
        detail: `${w.name} workflow saved`,
        ts: w.created_at,
        kind: "workflow",
      });
    }

    return list.sort((a, b) => b.ts - a.ts).slice(0, 8);
  }, [tools, workflows]);

  return (
    <div className="rounded-xl border border-white/[0.08] bg-panel/90 p-5 shadow-panel backdrop-blur-sm">
      <h3 className="mb-3 text-sm font-semibold text-slate-300">Memory timeline</h3>
      {entries.length === 0 ? (
        <p className="text-xs text-slate-600">No memory yet - run a task to begin.</p>
      ) : (
        <ul className="space-y-3">
          {entries.map((e) => (
            <li key={e.id} className="border-l-2 border-white/10 pl-3">
              <p
                className={
                  e.kind === "reuse"
                    ? "text-[10px] font-semibold uppercase text-reuse"
                    : e.kind === "workflow"
                      ? "text-[10px] font-semibold uppercase text-slate-500"
                      : "text-[10px] font-semibold uppercase text-accent"
                }
              >
                {e.label}
              </p>
              <p className="mt-0.5 text-xs text-slate-400">{e.detail}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
