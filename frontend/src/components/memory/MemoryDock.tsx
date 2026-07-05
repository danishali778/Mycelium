"use client";

import { useMemo, useState } from "react";
import { WorkflowCard } from "@/components/workflows/WorkflowCard";
import { Panel } from "@/components/ui/Panel";
import { useCockpit } from "@/context/CockpitContext";
import type { Tool } from "@/lib/types";
import type { TaskTool } from "@/lib/runArtifacts";
import { cn } from "@/lib/utils";

type Tab = "task" | "library" | "workflows" | "runs";

function formatTime(ts?: number) {
  if (!ts) return "Not run yet";
  return new Date(ts).toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
}

export function MemoryDock({
  taskTools = [],
  selectedToolName,
  onSelectTool,
}: {
  taskTools?: TaskTool[];
  selectedToolName?: string | null;
  onSelectTool?: (name: string) => void;
}) {
  const { tools, workflows, sessions, events, running, sourceRef, run, refreshWorkflows } = useCockpit();
  const [tab, setTab] = useState<Tab>("task");

  const reusedNames = useMemo(() => {
    return new Set(
      events
        .filter((e) => e.type === "tool.matched" || e.type === "tool.called")
        .map((e) => e.data?.name as string)
        .filter(Boolean)
    );
  }, [events]);

  const tabs: { id: Tab; label: string; count: number }[] = [
    { id: "task", label: "Task", count: taskTools.length },
    { id: "library", label: "Library", count: tools.length },
    { id: "workflows", label: "Flows", count: workflows.length },
    { id: "runs", label: "Runs", count: sessions.filter((s) => s.lastRunAt).length },
  ];

  return (
    <Panel
      title="Memory"
      badge={
        <span className="rounded-full border border-reuse/20 bg-reuse/10 px-2 py-0.5 text-[10px] font-semibold text-reuse">
          persistent
        </span>
      }
      className="min-h-0"
      bodyClassName="p-0"
    >
      <div className="grid grid-cols-4 border-b border-white/[0.06] bg-base/30 p-1">
        {tabs.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id)}
            className={cn(
              "rounded-lg px-1.5 py-2 text-xs font-medium transition-all",
              tab === item.id
                ? "bg-accent/12 text-accent"
                : "text-slate-500 hover:bg-white/[0.04] hover:text-slate-300"
            )}
          >
            {item.label}
            <span className="ml-1 text-[10px] opacity-60">{item.count}</span>
          </button>
        ))}
      </div>

      <div className="scrollbar-thin min-h-0 flex-1 overflow-y-auto p-3">
        {tab === "task" && (
          <div className="space-y-3">
            {taskTools.length === 0 ? (
              <EmptyState
                title="No task tools yet"
                body={
                  events.length === 0
                    ? "Run a prompt to see the exact tools Mycelium selects for that task."
                    : "Mycelium is still planning. Selected tools will appear here as the run progresses."
                }
              />
            ) : (
              <>
                <p className="px-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-600">
                  Selected for this task
                </p>
                {taskTools.map((tool) => (
                  <TaskToolCard
                    key={tool.name}
                    tool={tool}
                    selected={selectedToolName === tool.name}
                    onSelect={() => onSelectTool?.(tool.name)}
                  />
                ))}
              </>
            )}
          </div>
        )}

        {tab === "library" && (
          <div className="space-y-3">
            {tools.length === 0 ? (
              <EmptyState
                title="No tools yet"
                body="Ask for a task that needs a new capability. Tool cards will appear here and stay across refreshes."
              />
            ) : (
              tools.map((tool) => (
                <CompactToolCard
                  key={tool.id}
                  tool={tool}
                  justUsed={reusedNames.has(tool.name)}
                />
              ))
            )}
          </div>
        )}

        {tab === "workflows" && (
          <div className="space-y-3">
            {workflows.length === 0 ? (
              <EmptyState
                title="No saved workflows"
                body="Complete a run, then save the proposed recipe so it can be reused on the next CSV."
              />
            ) : (
              workflows.map((workflow) => (
                <WorkflowCard
                  key={workflow.id}
                  workflow={workflow}
                  onRun={() => run("", workflow.id)}
                  disabled={running || !sourceRef}
                  onDeleted={refreshWorkflows}
                />
              ))
            )}
          </div>
        )}

        {tab === "runs" && (
          <div className="space-y-3">
            {sessions.length === 0 ? (
              <EmptyState
                title="No sessions"
                body="Connected CSV files and their latest goals will be listed here for quick orientation."
              />
            ) : (
              sessions.map((session) => (
                <div
                  key={session.id}
                  className="rounded-xl border border-white/[0.08] bg-base/50 p-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-slate-200">
                        {session.filename}
                      </p>
                      <p className="mt-1 text-[10px] text-slate-500">
                        {session.rows} rows / {session.columns} cols
                      </p>
                    </div>
                    <span className="shrink-0 text-[10px] text-slate-600">
                      {formatTime(session.lastRunAt)}
                    </span>
                  </div>
                  {session.lastGoal && (
                    <p className="mt-3 line-clamp-2 rounded-lg bg-panel/70 px-2.5 py-2 text-xs text-slate-400">
                      {session.lastGoal}
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </Panel>
  );
}

function CompactToolCard({ tool, justUsed }: { tool: Tool; justUsed: boolean }) {
  return (
    <div
      className={cn(
        "rounded-xl border bg-base/50 p-3 transition-colors",
        justUsed ? "border-reuse/40 bg-reuse/[0.06]" : "border-white/[0.08]"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate font-mono text-sm text-accent">{tool.name}</p>
          <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-slate-500">
            {tool.description}
          </p>
        </div>
        <span className="shrink-0 rounded-full bg-reuse/10 px-2 py-0.5 text-[10px] text-reuse">
          {tool.usage_count}x
        </span>
      </div>
      <code className="mt-3 block truncate rounded-lg bg-panel/70 px-2.5 py-2 text-[10px] text-slate-600">
        {tool.signature}
      </code>
    </div>
  );
}

function TaskToolCard({
  tool,
  selected,
  onSelect,
}: {
  tool: TaskTool;
  selected: boolean;
  onSelect: () => void;
}) {
  const statusClass =
    tool.status === "failed"
      ? "border-danger/30 bg-danger/10 text-danger"
      : tool.status === "executed"
        ? "border-success/30 bg-success/10 text-success"
        : tool.source === "generated"
          ? "border-accent/30 bg-accent/10 text-accent"
          : "border-reuse/30 bg-reuse/10 text-reuse";

  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "w-full rounded-xl border p-2.5 text-left transition-all",
        selected
          ? "border-accent/50 bg-accent/[0.08] shadow-glow-sm"
          : "border-white/[0.08] bg-base/50 hover:border-accent/25 hover:bg-white/[0.03]"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate font-mono text-sm text-accent">{tool.name}</p>
        </div>
        <span className={cn("shrink-0 rounded-full border px-2 py-0.5 text-[10px]", statusClass)}>
          {tool.status}
        </span>
      </div>
      <p className="mt-1 line-clamp-1 text-xs leading-relaxed text-slate-500">
        {tool.result?.summary || tool.description || "Waiting for execution details."}
      </p>
      <div className="mt-2 flex items-center gap-2">
        <span className="shrink-0 text-[10px] uppercase tracking-[0.14em] text-slate-700">
          {tool.source === "generated" ? "Generated" : "Memory"}
        </span>
        <code className="min-w-0 flex-1 truncate rounded-md bg-panel/70 px-2 py-1 text-[10px] text-slate-600">
          {tool.signature || "signature pending"}
        </code>
      </div>
    </button>
  );
}

function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-xl border border-dashed border-white/10 bg-base/40 px-4 py-6 text-center">
      <p className="text-sm font-medium text-slate-400">{title}</p>
      <p className="mt-2 text-xs leading-relaxed text-slate-600">{body}</p>
    </div>
  );
}
