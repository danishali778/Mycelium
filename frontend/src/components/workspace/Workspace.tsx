"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import type { ProposedWorkflow, RunEvent } from "@/lib/types";
import type { TaskTool } from "@/lib/runArtifacts";
import { LiveCodePanel } from "@/components/workspace/LiveCodePanel";
import { RepairDiff } from "@/components/workspace/RepairDiff";
import { ToolResultPreview } from "@/components/workspace/ToolResultPreview";
import { SaveWorkflowPrompt } from "@/components/workflows/SaveWorkflowPrompt";
import { sanitizeEventText } from "@/components/reasoning/EventMarkers";

export function Workspace({
  events,
  proposedWorkflow,
  onWorkflowSaved,
  buildingNew = false,
  selectedTaskTool,
}: {
  events: RunEvent[];
  proposedWorkflow: ProposedWorkflow | null;
  onWorkflowSaved: () => void;
  buildingNew?: boolean;
  selectedTaskTool?: TaskTool | null;
}) {
  const latestCode = useMemo(() => {
    const codeEvents = events.filter(
      (e) => e.type === "synthesis.code" || e.type === "synthesis.repair"
    );
    return (codeEvents.at(-1)?.data?.code as string) ?? "";
  }, [events]);

  const toolName = useMemo(() => {
    const spec = [...events].reverse().find((e) => e.type === "synthesis.spec");
    const registered = [...events].reverse().find((e) => e.type === "synthesis.registered");
    return (
      (spec?.data?.name as string) ??
      (registered?.data?.name as string) ??
      null
    );
  }, [events]);

  const lastError = useMemo(() => {
    const errs = events.filter((e) => e.type === "synthesis.error");
    return (errs.at(-1)?.data?.error as string) ?? null;
  }, [events]);

  const finalAnswer = useMemo(() => {
    const done = events.find((e) => e.type === "run.completed");
    const answer = (done?.data?.final_answer as string) ?? null;
    return answer ? sanitizeEventText(answer) : null;
  }, [events]);

  const displayCode = selectedTaskTool?.code || latestCode;
  const displayToolName = selectedTaskTool?.name ?? toolName;
  const isBuildingSelectedTool = selectedTaskTool?.status === "building";

  return (
    <div className="scrollbar-thin flex min-h-0 min-w-0 flex-col gap-4 overflow-y-auto overflow-x-hidden pb-1 pr-1">
      <LiveCodePanel
        code={displayCode}
        toolName={displayToolName}
        buildingNew={(buildingNew && !!latestCode && !selectedTaskTool) || isBuildingSelectedTool}
        title={selectedTaskTool ? "Selected Tool" : "Building New Tool"}
        toolStatus={selectedTaskTool?.status}
        toolSource={selectedTaskTool?.source}
        emptyMessage={
          selectedTaskTool
            ? "This selected tool has no code loaded yet."
            : "No tool being written yet - start a run to watch live synthesis."
        }
      />
      {lastError && <RepairDiff error={lastError} />}
      <ToolResultPreview tool={selectedTaskTool ?? null} />
      {finalAnswer && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="shrink-0 rounded-xl border border-success/25 bg-success/[0.05] px-4 py-3 shadow-panel"
        >
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-success">
            Run Summary
          </p>
          <p className="mt-1.5 whitespace-pre-wrap text-sm leading-relaxed text-slate-300">
            {finalAnswer}
          </p>
        </motion.div>
      )}
      <SaveWorkflowPrompt proposed={proposedWorkflow} onSaved={onWorkflowSaved} />
    </div>
  );
}
