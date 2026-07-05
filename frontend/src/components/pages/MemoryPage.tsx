"use client";

import { useMemo } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { MemoryNetwork } from "@/components/memory/MemoryNetwork";
import { MemoryTimeline } from "@/components/memory/MemoryTimeline";
import { Panel } from "@/components/ui/Panel";
import { useCockpit } from "@/context/CockpitContext";

export function MemoryPage() {
  const { tools, workflows } = useCockpit();

  const totalUses = useMemo(
    () => tools.reduce((sum, t) => sum + t.usage_count, 0),
    [tools]
  );

  const stats = [
    { label: "Tools saved", value: tools.length, color: "text-accent" },
    { label: "Total reuses", value: totalUses, color: "text-reuse" },
    { label: "Workflows", value: workflows.length, color: "text-slate-100" },
    { label: "Persists", value: "100%", color: "text-success" },
  ];

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <PageHeader
        title="Memory"
        subtitle="Persistent knowledge that compounds across sessions"
      />

      <div className="flex-1 overflow-y-auto px-6 pb-6 scrollbar-thin">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((s) => (
            <Panel key={s.label} className="shadow-panel">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                {s.label}
              </p>
              <p className={`mt-2 text-3xl font-semibold ${s.color}`}>{s.value}</p>
            </Panel>
          ))}
        </div>

        <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_300px]">
          <MemoryNetwork tools={tools} />
          <MemoryTimeline tools={tools} workflows={workflows} />
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <Panel className="border-success/20 bg-success/[0.04]">
            <h3 className="text-sm font-semibold text-success">What persists</h3>
            <ul className="mt-3 space-y-2 text-sm text-slate-400">
              <li>Saved: Tools - reusable Python capabilities</li>
              <li>Saved: Workflows - task recipes</li>
              <li>Saved: Usage stats - compounding over time</li>
            </ul>
          </Panel>
          <Panel>
            <h3 className="text-sm font-semibold text-slate-400">What resets each session</h3>
            <ul className="mt-3 space-y-2 text-sm text-slate-500">
              <li>Session-only: Uploaded CSV data source</li>
              <li>Session-only: current reasoning stream</li>
              <li>Session-only: source profile tied to this upload</li>
            </ul>
          </Panel>
        </div>

        <p className="mt-8 text-center text-sm italic text-slate-600">
          Code interpreters have amnesia. Mycelium has memory.
        </p>
      </div>
    </div>
  );
}
