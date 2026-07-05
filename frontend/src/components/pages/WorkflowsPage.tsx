"use client";

import { useMemo, useRef, useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { WorkflowCard } from "@/components/workflows/WorkflowCard";
import { SaveWorkflowPrompt } from "@/components/workflows/SaveWorkflowPrompt";
import { useCockpit } from "@/context/CockpitContext";

export function WorkflowsPage() {
  const {
    workflows,
    running,
    sourceRef,
    run,
    proposedWorkflow,
    workflowCandidates,
    refreshWorkflows,
  } = useCockpit();

  const [showSavePrompt, setShowSavePrompt] = useState(false);
  const savePromptRef = useRef<HTMLDivElement>(null);

  const compatibleNames = useMemo(
    () => new Set(workflowCandidates.map((c) => c.name)),
    [workflowCandidates]
  );

  const hasProposal = !!proposedWorkflow;
  const promptVisible = hasProposal && (showSavePrompt || workflows.length === 0);

  function handleSaveFromLastRun() {
    if (!hasProposal) return;
    setShowSavePrompt(true);
    requestAnimationFrame(() =>
      savePromptRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <PageHeader
        title="Workflows"
        subtitle="Saved recipes - reusable task sequences bound to your tools"
        actions={
          <button
            type="button"
            onClick={handleSaveFromLastRun}
            disabled={!hasProposal}
            title={
              hasProposal
                ? "Save the workflow proposed by the last run"
                : "Complete a run on Workspace first - Mycelium will propose a recipe to save"
            }
            className="flex items-center gap-2 rounded-xl border border-accent/30 bg-accent/[0.06] px-4 py-2.5 text-xs font-medium text-accent shadow-panel transition-all hover:border-accent/50 hover:bg-accent/10 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Save from last run
          </button>
        }
      />

      <div className="scrollbar-thin flex-1 space-y-4 overflow-y-auto px-6 pb-6">
        {promptVisible && (
          <div ref={savePromptRef}>
            <SaveWorkflowPrompt proposed={proposedWorkflow} onSaved={refreshWorkflows} />
          </div>
        )}

        {workflows.map((wf) => (
          <WorkflowCard
            key={wf.id}
            workflow={wf}
            onRun={() => run("", wf.id)}
            disabled={running || !sourceRef}
            onDeleted={refreshWorkflows}
            compatible={compatibleNames.has(wf.name)}
            expanded
          />
        ))}

        <div className="flex items-center justify-center gap-4 rounded-2xl border border-dashed border-white/10 bg-panel/30 px-6 py-8">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/10 bg-base/50 text-slate-500">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
          </span>
          <div>
            <p className="text-sm text-slate-400">
              {workflows.length === 0
                ? "No workflow yet - complete a run and save the recipe"
                : "Save more recipes from completed runs"}
            </p>
            <p className="mt-1 text-xs text-slate-600">
              Workflows you save will appear here for one-click reuse.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
