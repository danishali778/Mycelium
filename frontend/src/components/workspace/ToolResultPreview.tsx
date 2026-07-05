"use client";

import { motion } from "framer-motion";
import { Panel } from "@/components/ui/Panel";
import type { TaskTool } from "@/lib/runArtifacts";
import { formatArtifactValue, rowsFromResultData } from "@/lib/runArtifacts";
import { cn } from "@/lib/utils";

function formatCell(column: string, value: unknown): string {
  if (
    typeof value === "number" &&
    /(amount|cost|price|revenue|sales|total)/i.test(column)
  ) {
    return `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
  return formatArtifactValue(value);
}

function prettyColumn(column: string): string {
  return column.replace(/_/g, " ");
}

export function ToolResultPreview({ tool }: { tool: TaskTool | null }) {
  const rows = rowsFromResultData(tool?.result?.data);
  const columns =
    rows.length > 0 ? [...new Set(rows.flatMap((row) => Object.keys(row)))] : [];
  const hasTable = rows.length > 0 && columns.length > 0;
  const failed = tool?.result?.ok === false;

  const executionSeconds =
    tool?.startedAt != null && tool?.result?.finishedAt != null
      ? Math.max(0, (tool.result.finishedAt - tool.startedAt) / 1000)
      : null;

  function copyResult() {
    if (!tool?.result) return;
    const payload = hasTable
      ? [columns.join(","), ...rows.map((row) => columns.map((c) => formatArtifactValue(row[c])).join(","))].join("\n")
      : tool.result.raw || tool.result.summary || "";
    navigator.clipboard.writeText(payload);
  }

  return (
    <Panel
      title="Result Preview"
      pattern
      className="shrink-0"
      bodyClassName="p-0"
      noPadding
      badge={
        tool?.result ? (
          <div className="flex items-center gap-2">
            {hasTable && (
              <span className="rounded-md border border-white/[0.08] bg-base/60 px-2 py-0.5 text-[10px] text-slate-400">
                Rows: {rows.length}
              </span>
            )}
            <button
              type="button"
              onClick={copyResult}
              className="flex items-center gap-1 rounded-md border border-white/[0.08] bg-base/60 px-2 py-0.5 text-[10px] text-slate-400 transition-colors hover:border-accent/30 hover:text-accent"
            >
              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
              </svg>
              Export
            </button>
          </div>
        ) : null
      }
    >
      {!tool ? (
        <EmptyBody
          title="No tool selected."
          body="Pick a tool from the task list to inspect its code and output."
        />
      ) : !tool.result ? (
        <EmptyBody
          title="Waiting for execution."
          body={`Output will appear here when Mycelium runs ${tool.name}.`}
        />
      ) : (
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
          {failed ? (
            <div className="px-4 py-4">
              <p className="text-sm font-medium text-danger">Execution failed</p>
              <pre className="mt-2 whitespace-pre-wrap rounded-lg border border-danger/20 bg-danger/[0.06] p-3 font-mono text-xs leading-relaxed text-danger/90">
                {tool.result.error || "Unknown error"}
              </pre>
            </div>
          ) : hasTable ? (
            <div className="scrollbar-thin overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-white/[0.08] bg-base/50">
                    <th className="w-10 px-3 py-2.5 font-mono text-[10px] font-medium text-slate-600" />
                    {columns.map((column) => (
                      <th
                        key={column}
                        className="whitespace-nowrap px-4 py-2.5 font-mono text-[11px] font-semibold capitalize tracking-wide text-accent"
                      >
                        {prettyColumn(column)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, rowIndex) => (
                    <tr
                      key={rowIndex}
                      className="border-b border-white/[0.04] transition-colors last:border-0 hover:bg-white/[0.02]"
                    >
                      <td className="px-3 py-2.5 font-mono text-[10px] tabular-nums text-slate-600">
                        {rowIndex + 1}
                      </td>
                      {columns.map((column) => (
                        <td
                          key={column}
                          className="whitespace-nowrap px-4 py-2.5 font-mono text-xs text-slate-300"
                        >
                          {formatCell(column, row[column])}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <pre className="whitespace-pre-wrap px-4 py-4 font-mono text-xs leading-relaxed text-slate-300">
              {tool.result.raw || tool.result.summary || "Tool completed without tabular output."}
            </pre>
          )}

          <div className="flex items-center justify-between border-t border-white/[0.06] bg-base/40 px-4 py-2">
            <span
              className={cn(
                "flex items-center gap-1.5 text-[10px]",
                failed ? "text-danger" : "text-success"
              )}
            >
              {failed ? (
                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              )}
              {failed ? "Failed" : hasTable ? `${rows.length} row${rows.length === 1 ? "" : "s"}` : "Completed"}
            </span>
            <span className="flex items-center gap-1.5 text-[10px] text-slate-500">
              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {executionSeconds != null
                ? `Execution time: ${executionSeconds.toFixed(2)}s`
                : tool.result.stepIntent || `Executed ${tool.name}`}
            </span>
          </div>
        </motion.div>
      )}
    </Panel>
  );
}

function EmptyBody({ title, body }: { title: string; body: string }) {
  return (
    <div className="m-4 rounded-lg border border-dashed border-white/10 bg-base/40 px-4 py-8 text-center">
      <p className="text-sm text-slate-500">{title}</p>
      <p className="mt-2 text-xs text-slate-700">{body}</p>
    </div>
  );
}
