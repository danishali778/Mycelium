"use client";

import type { RunEvent, SourceProfile, WorkflowStep } from "@/lib/types";
import { cn } from "@/lib/utils";

/** Inline tags reserved for the signature moments (per docs/03-design.md). */
const TAGS: Record<string, { text: string; className: string }> = {
  "tool.gap_detected": {
    text: "GAP DETECTED",
    className: "bg-accent/15 text-accent",
  },
  "tool.matched": {
    text: "REUSE",
    className: "bg-reuse/15 text-reuse",
  },
  "synthesis.code": {
    text: "BUILDING NEW TOOL",
    className: "bg-accent/15 text-accent",
  },
  "synthesis.repair": {
    text: "SELF-REPAIR",
    className: "bg-amber-400/15 text-amber-300",
  },
  "synthesis.error": {
    text: "ERROR",
    className: "bg-danger/15 text-danger",
  },
  "synthesis.registered": {
    text: "TOOL SAVED",
    className: "bg-accent/15 text-accent",
  },
  "run.completed": {
    text: "DONE",
    className: "bg-success/15 text-success",
  },
  error: {
    text: "ERROR",
    className: "bg-danger/15 text-danger",
  },
};

const UUID_RE = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi;

/** Strip internal identifiers and upload paths from user-facing text. */
export function sanitizeEventText(text: string): string {
  return text
    .replace(/[\w./\\:-]*[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}[\w.-]*/gi, (match) =>
      match.toLowerCase().endsWith(".csv") ? "connected CSV" : ""
    )
    .replace(UUID_RE, "")
    .replace(/\(\s*\)/g, "")
    .replace(/\s{2,}/g, " ")
    .replace(/\s+([,.:;])/g, "$1")
    .trim();
}

function formatClock(ts?: number) {
  const d = ts ? new Date(ts) : new Date();
  return d.toLocaleTimeString("en-GB", { hour12: false });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function detailForEvent(event: RunEvent): string | null {
  if (event.type === "source.profiled" && isRecord(event.data.profile)) {
    const profile = event.data.profile as unknown as SourceProfile;
    return `${profile.row_count} rows, ${profile.column_count} columns`;
  }

  if (event.type === "plan.created" && Array.isArray(event.data.workflow_plan)) {
    const steps = event.data.workflow_plan as WorkflowStep[];
    const names = steps.map((step) => step.intent).filter(Boolean).slice(0, 2);
    return `${steps.length} step${steps.length === 1 ? "" : "s"}${names.length ? `: ${names.join(" -> ")}` : ""}`;
  }

  if (event.type === "workflow.match_candidates" && Array.isArray(event.data.candidates)) {
    return `${event.data.candidates.length} compatible workflow(s) found`;
  }

  if (event.type === "tool.gap_detected" && isRecord(event.data.step)) {
    return String(event.data.step.intent ?? event.data.step.tool_query ?? "");
  }

  if (event.type === "tool.called") {
    const summary =
      event.data.summary ??
      (isRecord(event.data.step_result) ? event.data.step_result.summary : null);
    return summary ? String(summary) : null;
  }

  if (event.type === "error") {
    return String(event.data.detail ?? event.data.error ?? "");
  }

  return null;
}

export function EventMarker({ event }: { event: RunEvent }) {
  const tag = TAGS[event.type];
  const message = sanitizeEventText(event.message);
  const rawDetail = detailForEvent(event);
  const detail = rawDetail ? sanitizeEventText(rawDetail) : null;

  if (!message && !detail) return null;

  return (
    <div className="group flex min-w-0 gap-2 rounded px-1.5 py-[3px] transition-colors hover:bg-white/[0.03]">
      <span className="shrink-0 select-none pt-px font-mono text-[10px] tabular-nums text-slate-600">
        [{formatClock(event.receivedAt)}]
      </span>
      <div className="min-w-0 flex-1">
        <p className="min-w-0 text-[11px] leading-[1.6] text-slate-400 [overflow-wrap:anywhere]">
          {tag && (
            <span
              className={cn(
                "mr-1.5 inline-block rounded px-1.5 py-px align-middle text-[9px] font-bold tracking-[0.08em]",
                tag.className
              )}
            >
              {tag.text}
            </span>
          )}
          <span className={tag ? "text-slate-300" : undefined}>{message}</span>
        </p>
        {detail && (
          <p className="min-w-0 text-[10px] leading-[1.6] text-slate-600 [overflow-wrap:anywhere]">
            {detail}
          </p>
        )}
      </div>
    </div>
  );
}
