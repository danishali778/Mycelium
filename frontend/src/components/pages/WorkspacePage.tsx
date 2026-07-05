"use client";

import { useEffect, useMemo, useState } from "react";
import { CommandBar } from "@/components/input/CommandBar";
import { PageHeader } from "@/components/layout/PageHeader";
import { ReasoningStream } from "@/components/reasoning/ReasoningStream";
import { SourceProfileCard } from "@/components/source/SourceProfileCard";
import { Workspace } from "@/components/workspace/Workspace";
import { MemoryDock } from "@/components/memory/MemoryDock";
import { useCockpit } from "@/context/CockpitContext";
import { deriveTaskTools } from "@/lib/runArtifacts";

export function WorkspacePage() {
  const {
    setSource,
    sourceRef,
    sourceProfile,
    events,
    running,
    run,
    proposedWorkflow,
    workflowCandidates,
    refreshWorkflows,
    sessions,
    tools,
    workflows,
  } = useCockpit();
  const [selectedToolName, setSelectedToolName] = useState<string | null>(null);

  const buildingNew = useMemo(
    () => events.some((e) => e.type === "tool.gap_detected" || e.type === "synthesis.code"),
    [events]
  );
  const taskTools = useMemo(() => deriveTaskTools(events, tools), [events, tools]);
  const latestTaskToolName = taskTools.at(-1)?.name ?? null;
  const selectedTaskTool = useMemo(
    () => taskTools.find((tool) => tool.name === selectedToolName) ?? taskTools.at(-1) ?? null,
    [selectedToolName, taskTools]
  );
  const showSourceProfileRibbon = !!sourceProfile && events.length === 0;

  useEffect(() => {
    setSelectedToolName((current) => {
      if (taskTools.length === 0) return null;
      if (running && latestTaskToolName) return latestTaskToolName;
      if (current && taskTools.some((tool) => tool.name === current)) return current;
      return latestTaskToolName;
    });
  }, [latestTaskToolName, running, taskTools]);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <PageHeader
        title="Workspace"
        subtitle="Turn one-off CSV work into reusable tools and workflows"
        actions={
          <div className="grid grid-cols-3 overflow-hidden rounded-xl border border-white/[0.08] bg-panel/80 shadow-panel">
            <Metric label="Sessions" value={sessions.length} />
            <Metric label="Tools" value={tools.length} accent />
            <Metric label="Workflows" value={workflows.length} reuse />
          </div>
        }
      />

      <div className="space-y-4 px-6 pb-5">
        <CommandBar
          onUploaded={setSource}
          onSubmit={(goal) => run(goal)}
          disabled={running || !sourceRef}
          disabledLabel={running ? "Working..." : "Connect CSV"}
          placeholder={sourceRef ? undefined : "Connect a CSV source first"}
          sourceProfile={sourceProfile}
        />
        {showSourceProfileRibbon && <SourceProfileCard profile={sourceProfile} />}
        {workflowCandidates.length > 0 && (
          <p className="text-xs text-reuse">
            Compatible workflows: {workflowCandidates.map((c) => c.name).join(", ")} - run from
            Workflows page
          </p>
        )}
      </div>

      <main className="grid min-h-0 flex-1 grid-cols-[minmax(270px,24%)_minmax(420px,1fr)_minmax(340px,28%)] gap-4 overflow-hidden px-6 pb-6">
        <ReasoningStream events={events} running={running} />
        <Workspace
          events={events}
          proposedWorkflow={proposedWorkflow}
          onWorkflowSaved={refreshWorkflows}
          buildingNew={buildingNew}
          selectedTaskTool={selectedTaskTool}
        />
        <MemoryDock
          taskTools={taskTools}
          selectedToolName={selectedTaskTool?.name ?? null}
          onSelectTool={setSelectedToolName}
        />
      </main>
    </div>
  );
}

function Metric({
  label,
  value,
  accent = false,
  reuse = false,
}: {
  label: string;
  value: number;
  accent?: boolean;
  reuse?: boolean;
}) {
  return (
    <div className="border-r border-white/[0.06] px-4 py-2 last:border-r-0">
      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-600">
        {label}
      </p>
      <p className={accent ? "text-lg font-semibold text-accent" : reuse ? "text-lg font-semibold text-reuse" : "text-lg font-semibold text-slate-200"}>
        {value}
      </p>
    </div>
  );
}
