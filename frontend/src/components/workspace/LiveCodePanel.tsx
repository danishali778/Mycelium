"use client";

import Editor from "@monaco-editor/react";
import { Panel } from "@/components/ui/Panel";
import { cn } from "@/lib/utils";

export function LiveCodePanel({
  code,
  toolName,
  buildingNew = false,
  title = "Building New Tool",
  toolStatus,
  toolSource,
  emptyMessage = "No tool being written yet - start a run to watch live synthesis.",
}: {
  code: string;
  toolName?: string | null;
  buildingNew?: boolean;
  title?: string;
  toolStatus?: string;
  toolSource?: string;
  emptyMessage?: string;
}) {
  const filename = toolName ? `tool: ${toolName}.py` : null;

  return (
    <Panel
      title={title}
      className="h-[240px] shrink-0"
      bodyClassName="min-h-0 p-0"
      noPadding
      badge={
        <div className="flex items-center gap-2">
          {toolSource && code && (
            <span
              className={cn(
                "rounded-full border px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.1em]",
                toolSource === "generated"
                  ? "border-accent/25 bg-accent/10 text-accent"
                  : "border-reuse/25 bg-reuse/10 text-reuse"
              )}
            >
              {toolSource === "generated" ? "new" : "memory"}
            </span>
          )}
          {buildingNew ? (
            <span className="flex items-center gap-1.5 rounded-full bg-accent/15 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-accent">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent" />
              In progress
            </span>
          ) : toolStatus === "failed" ? (
            <span className="rounded-full bg-danger/15 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-danger">
              failed
            </span>
          ) : filename ? (
            <span className="font-mono text-[10px] text-slate-500">{filename}</span>
          ) : null}
        </div>
      }
    >
      {code ? (
        <div className="h-[196px]">
          <Editor
            height="196px"
            defaultLanguage="python"
            value={code}
            theme="vs-dark"
            options={{
              readOnly: true,
              minimap: { enabled: false },
              fontSize: 12.5,
              lineNumbers: "on",
              scrollBeyondLastLine: false,
              padding: { top: 12, bottom: 12 },
              renderLineHighlight: "none",
              overviewRulerLanes: 0,
              folding: false,
            }}
          />
        </div>
      ) : (
        <div className="flex flex-1 items-center justify-center px-6 py-16 text-center text-sm text-slate-600">
          {emptyMessage}
        </div>
      )}
    </Panel>
  );
}
