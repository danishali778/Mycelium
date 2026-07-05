"use client";

import { WorkflowCard } from "@/components/workflows/WorkflowCard";
import type { WorkflowRecipe } from "@/lib/types";

export function WorkflowShelf({
  workflows,
  onRun,
  disabled,
}: {
  workflows: WorkflowRecipe[];
  onRun: (workflowId: string) => void;
  disabled?: boolean;
}) {
  return (
    <section className="flex flex-1 flex-col overflow-hidden bg-base">
      <h2 className="px-4 py-2 text-xs font-semibold uppercase tracking-widest text-slate-500">
        Workflows {workflows.length > 0 && `(${workflows.length})`}
      </h2>
      <div className="flex-1 space-y-2 overflow-y-auto px-3 pb-4">
        {workflows.length === 0 && (
          <p className="px-1 py-4 text-sm text-slate-600">
            No saved workflows yet. Complete a run and save the proposed recipe.
          </p>
        )}
        {workflows.map((wf) => (
          <WorkflowCard
            key={wf.id}
            workflow={wf}
            onRun={() => onRun(wf.id)}
            disabled={disabled}
          />
        ))}
      </div>
    </section>
  );
}
