"use client";

import { useMemo } from "react";
import type { RunEvent, SourceProfile } from "@/lib/types";
import { Panel } from "@/components/ui/Panel";
import { cn } from "@/lib/utils";

const PHASES = [
  { id: "ingest", label: "Ingest & Profile", events: ["source.profiled"] },
  { id: "plan", label: "Plan Workflow", events: ["plan.created"] },
  {
    id: "match",
    label: "Match Tools",
    events: ["tool.matched", "workflow.match_candidates", "tool.gap_detected"],
  },
  {
    id: "build",
    label: "Build Tool",
    events: ["synthesis.code", "synthesis.repair", "synthesis.registered"],
  },
  { id: "execute", label: "Execute Steps", events: ["tool.called", "step.observed"] },
  { id: "synthesize", label: "Synthesize Result", events: ["run.completed"] },
] as const;

type PhaseStatus = "completed" | "active" | "pending";

function phaseIndexForEvents(eventTypes: Set<string>): number {
  for (let i = PHASES.length - 1; i >= 0; i--) {
    if (PHASES[i].events.some((t) => eventTypes.has(t))) return i;
  }
  return -1;
}

function formatDirtyLabel(pattern: string) {
  return pattern
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export function ActiveRunPanel({
  events,
  sourceProfile,
  running,
  workflowCandidates = [],
  compact = false,
}: {
  events: RunEvent[];
  sourceProfile: SourceProfile | null;
  running: boolean;
  workflowCandidates?: { name: string; score: number }[];
  compact?: boolean;
}) {
  const eventTypes = useMemo(() => new Set(events.map((e) => e.type)), [events]);
  const activePhaseIdx = phaseIndexForEvents(eventTypes);

  const dirtyPatterns = useMemo(() => {
    if (!sourceProfile) return [];
    const set = new Set<string>();
    for (const col of sourceProfile.columns) {
      for (const p of col.dirty_patterns) set.add(p);
    }
    return [...set].slice(0, 6);
  }, [sourceProfile]);

  const completedCount = useMemo(() => {
    if (events.some((e) => e.type === "run.completed")) return PHASES.length;
    return Math.max(0, activePhaseIdx);
  }, [events, activePhaseIdx]);

  function statusFor(i: number): PhaseStatus {
    if (events.some((e) => e.type === "run.completed")) return "completed";
    if (i < activePhaseIdx) return "completed";
    if (i === activePhaseIdx && running) return "active";
    if (i === activePhaseIdx && !running && events.length > 0) return "completed";
    return "pending";
  }

  if (compact) {
    return (
      <Panel
        title="Run Pipeline"
        badge={
          <span className="text-[10px] font-medium text-slate-500">
            {completedCount}/{PHASES.length}
          </span>
        }
        className="shrink-0"
      >
        <div className="flex items-center gap-2">
          {PHASES.map((phase, i) => {
            const status = statusFor(i);
            return (
              <div key={phase.id} className="group relative flex flex-1 items-center">
                <span
                  className={cn(
                    "h-2.5 w-full rounded-full transition-colors",
                    status === "completed" && "bg-success/60",
                    status === "active" && "bg-accent",
                    status === "pending" && "bg-white/10"
                  )}
                />
                <span className="pointer-events-none absolute -top-8 left-1/2 hidden -translate-x-1/2 whitespace-nowrap rounded-md border border-white/10 bg-base px-2 py-1 text-[10px] text-slate-300 shadow-panel group-hover:block">
                  {phase.label}
                </span>
              </div>
            );
          })}
        </div>
        <div className="mt-4 flex items-center justify-between gap-3 text-xs">
          <span className={cn(running ? "text-accent" : "text-slate-500")}>
            {running ? "Agent running" : events.length > 0 ? "Last run complete" : "Waiting for run"}
          </span>
          {sourceProfile && (
            <span className="truncate text-slate-600">
              {sourceProfile.row_count} rows / {sourceProfile.column_count} cols
            </span>
          )}
        </div>
      </Panel>
    );
  }

  return (
    <div className="flex min-h-0 flex-col gap-4 overflow-y-auto scrollbar-thin pb-1">
      <Panel title="Active Run" className="shrink-0">
        {events.length === 0 && !sourceProfile ? (
          <p className="text-xs text-slate-600">
            Upload a CSV and run a task to track progress here.
          </p>
        ) : (
          <>
            <p className="mb-4 text-xs font-medium text-slate-400">
              {completedCount} / {PHASES.length} steps
            </p>
            <ol className="space-y-0">
              {PHASES.map((phase, i) => {
                const status = statusFor(i);
                const isLast = i === PHASES.length - 1;
                return (
                  <li key={phase.id} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <StepIcon status={status} />
                      {!isLast && (
                        <div
                          className={cn(
                            "my-1 w-px flex-1 min-h-[20px]",
                            status === "completed" ? "bg-success/40" : "bg-white/10"
                          )}
                        />
                      )}
                    </div>
                    <div className="pb-4 pt-0.5">
                      <p
                        className={cn(
                          "text-sm font-medium",
                          status === "active" && "text-accent",
                          status === "completed" && "text-slate-300",
                          status === "pending" && "text-slate-600"
                        )}
                      >
                        {phase.label}
                      </p>
                      <p className="text-[10px] capitalize text-slate-600">
                        {status === "completed"
                          ? "Completed"
                          : status === "active"
                            ? "In progress"
                            : "Pending"}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ol>
          </>
        )}
      </Panel>

      {sourceProfile && (
        <Panel title="Source Profile" className="shrink-0">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent/10 text-accent">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
            </div>
            <div className="min-w-0">
              <p className="truncate font-medium text-accent">{sourceProfile.filename}</p>
              <p className="mt-1 text-xs text-slate-500">
                {sourceProfile.row_count} rows / {sourceProfile.column_count} columns
              </p>
            </div>
          </div>
        </Panel>
      )}

      {dirtyPatterns.length > 0 && (
        <Panel title="Dirty Patterns Detected" className="shrink-0">
          <div className="flex flex-wrap gap-2">
            {dirtyPatterns.map((p) => (
              <span
                key={p}
                className="rounded-full border border-accent/25 bg-accent/5 px-2.5 py-1 text-[10px] text-accent"
              >
                {formatDirtyLabel(p)}
              </span>
            ))}
          </div>
        </Panel>
      )}

      {workflowCandidates.length > 0 && (
        <Panel title="Memory Match" className="shrink-0">
          {workflowCandidates.map((c) => (
            <div
              key={c.name}
              className="flex items-center justify-between rounded-lg border border-reuse/20 bg-reuse/5 px-3 py-2.5"
            >
              <div>
                <p className="font-mono text-sm text-reuse">{c.name}</p>
                <p className="text-[10px] text-slate-500">
                  {Math.round(c.score * 100)}% similar
                </p>
              </div>
              <span className="rounded-full bg-reuse/20 px-2 py-0.5 text-[10px] font-semibold uppercase text-reuse">
                Reuse
              </span>
            </div>
          ))}
        </Panel>
      )}
    </div>
  );
}

function StepIcon({ status }: { status: PhaseStatus }) {
  if (status === "completed") {
    return (
      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-success/15 text-success">
        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
        </svg>
      </span>
    );
  }
  if (status === "active") {
    return (
      <span className="relative flex h-6 w-6 items-center justify-center">
        <span className="absolute inset-0 animate-ping rounded-full bg-accent/30" />
        <span className="relative h-6 w-6 rounded-full border-2 border-accent bg-accent/10" />
      </span>
    );
  }
  return (
    <span className="flex h-6 w-6 items-center justify-center rounded-full border border-white/10 bg-base" />
  );
}
