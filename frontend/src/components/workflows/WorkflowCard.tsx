"use client";

import { useState } from "react";
import { deleteWorkflow } from "@/lib/api";
import type { WorkflowRecipe } from "@/lib/types";
import { cn } from "@/lib/utils";

function formatRelative(ts?: number | null) {
  if (!ts) return "never";
  const diff = Date.now() - ts * 1000;
  const hours = Math.floor(diff / 3600000);
  if (hours < 1) return "just now";
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function triggerTags(trigger: Record<string, unknown>): string[] {
  const tags: string[] = [];
  const cols = trigger.columns as { semantic_guess?: string; name?: string }[] | undefined;
  if (Array.isArray(cols)) {
    for (const c of cols) {
      if (c.semantic_guess) tags.push(c.semantic_guess);
      else if (c.name) tags.push(c.name);
    }
  }
  return [...new Set(tags)].slice(0, 4);
}

const ICONS = [
  // chart
  "M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z",
  // calendar
  "M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5",
  // export doc
  "M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m6.75 12l-3-3m0 0l-3 3m3-3v6m-1.5-15H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z",
  // funnel
  "M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 01-.659 1.591l-5.432 5.432a2.25 2.25 0 00-.659 1.591v2.927a2.25 2.25 0 01-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 00-.659-1.591L3.659 7.409A2.25 2.25 0 013 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0112 3z",
];

function iconFor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) | 0;
  return ICONS[Math.abs(hash) % ICONS.length];
}

function isNew(workflow: WorkflowRecipe): boolean {
  const ageHours = (Date.now() - workflow.created_at * 1000) / 3600000;
  return ageHours < 24 && workflow.usage_count <= 1;
}

export function WorkflowCard({
  workflow,
  onRun,
  disabled,
  onDeleted,
  expanded = false,
  compatible = false,
}: {
  workflow: WorkflowRecipe;
  onRun: () => void;
  disabled?: boolean;
  onDeleted?: () => void;
  expanded?: boolean;
  compatible?: boolean;
}) {
  const [busy, setBusy] = useState(false);
  const tags = triggerTags(workflow.trigger_profile);

  async function handleDelete() {
    if (!confirm(`Delete workflow "${workflow.name}"?`)) return;
    setBusy(true);
    try {
      await deleteWorkflow(workflow.id);
      onDeleted?.();
    } finally {
      setBusy(false);
    }
  }

  // Compact variant (memory dock).
  if (!expanded) {
    return (
      <div className="rounded-xl border border-white/[0.08] bg-panel/90 p-4 shadow-panel">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <span className="font-medium text-reuse">{workflow.name}</span>
            <p className="mt-1 text-xs text-slate-400">{workflow.description}</p>
          </div>
          <span className="shrink-0 text-[10px] text-slate-500">
            used {workflow.usage_count}x
          </span>
        </div>
        <p className="mt-2 text-[10px] text-slate-600">{workflow.steps.length} step(s)</p>
        <div className="mt-3 flex gap-2">
          <button
            type="button"
            onClick={onRun}
            disabled={disabled}
            className="rounded-lg bg-accent px-4 py-1.5 text-xs font-medium text-base hover:bg-accent/90 disabled:opacity-40"
          >
            Run
          </button>
          {onDeleted && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={busy}
              className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-slate-500 hover:border-danger/30 hover:text-danger disabled:opacity-40"
            >
              Delete
            </button>
          )}
        </div>
      </div>
    );
  }

  // Full-width row per the Workflows page mockup.
  return (
    <div className="rounded-2xl border border-white/[0.08] bg-panel/90 p-5 shadow-panel backdrop-blur-sm transition-colors hover:border-white/[0.14]">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start">
        {/* Icon + identity + trigger profile */}
        <div className="flex min-w-0 flex-1 gap-4">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-accent/20 bg-accent/[0.08] text-accent">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d={iconFor(workflow.name)} />
            </svg>
          </span>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-base font-semibold text-slate-100">{workflow.name}</h3>
              {compatible && (
                <span className="flex items-center gap-1 rounded-full border border-reuse/30 bg-reuse/10 px-2 py-0.5 text-[10px] font-medium text-reuse">
                  <svg className="h-2.5 w-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                  Compatible
                </span>
              )}
              {isNew(workflow) && (
                <span className="rounded-full bg-accent/15 px-2 py-0.5 text-[10px] font-bold tracking-wide text-accent">
                  NEW
                </span>
              )}
            </div>
            <p className="mt-1 text-sm text-slate-400">{workflow.description}</p>
            {tags.length > 0 && (
              <div className="mt-3">
                <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-slate-600">
                  Trigger profile
                </p>
                <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                  {tags.map((tag, i) => (
                    <span key={tag} className="flex items-center gap-1.5">
                      {i > 0 && <span className="text-[8px] text-slate-700">·</span>}
                      <span className="rounded-md border border-white/[0.08] bg-base/60 px-2 py-0.5 font-mono text-[10px] text-slate-400">
                        {tag}
                      </span>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Steps pipeline + goal */}
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium text-slate-500">
            {workflow.steps.length} step{workflow.steps.length === 1 ? "" : "s"}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            {workflow.steps.map((step, i) => (
              <span key={step.id} className="flex items-center gap-1.5">
                {i > 0 && (
                  <svg className="h-3 w-3 shrink-0 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                )}
                <span
                  className={cn(
                    "rounded-md border px-2 py-1 font-mono text-[10px]",
                    i === workflow.steps.length - 1
                      ? "border-reuse/25 bg-reuse/[0.08] text-reuse"
                      : "border-white/[0.08] bg-base/60 text-accent"
                  )}
                >
                  {step.tool_name || step.intent.slice(0, 24)}
                </span>
              </span>
            ))}
          </div>
          {workflow.created_from_goal && (
            <p className="mt-3 text-xs italic leading-relaxed text-slate-600">
              Created from goal: &ldquo;{workflow.created_from_goal}&rdquo;
            </p>
          )}
        </div>

        {/* Usage + actions */}
        <div className="flex shrink-0 flex-row items-center gap-3 lg:flex-col lg:items-end">
          <p className="whitespace-nowrap text-[10px] text-slate-500">
            used {workflow.usage_count}x
            <span className="mx-1 text-slate-700">·</span>
            last run {formatRelative(workflow.last_run_at)}
          </p>
          <div className="flex gap-2 lg:flex-col lg:items-stretch">
            <button
              type="button"
              onClick={onRun}
              disabled={disabled}
              className="flex items-center justify-center gap-1.5 rounded-lg bg-accent px-5 py-2 text-xs font-semibold text-base shadow-glow-sm transition-all hover:bg-accent/90 disabled:opacity-40"
            >
              <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
              Run
            </button>
            {onDeleted && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={busy}
                className="flex items-center justify-center gap-1.5 rounded-lg border border-white/[0.08] bg-base/40 px-4 py-2 text-xs text-slate-500 transition-colors hover:border-danger/30 hover:text-danger disabled:opacity-40"
              >
                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                </svg>
                Delete
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
