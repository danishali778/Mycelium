"use client";

import { motion } from "framer-motion";
import type { Tool } from "@/lib/types";
import { exportToolUrl } from "@/lib/api";
import { materialize, reusePulse } from "@/components/library/animations";
import { CodePreview } from "@/components/library/CodePreview";
import { cn } from "@/lib/utils";

function shortSignature(tool: Tool): string {
  const sig = tool.signature || `${tool.name}(csv_path)`;
  // Strip type hints + return annotation for the compact pill, per the mockup.
  return sig
    .replace(/\s*->.*$/, "")
    .replace(/:\s*[\w[\]., |]+(?=[,)])/g, "")
    .replace(/\s{2,}/g, " ");
}

export function ToolCard({
  tool,
  justUsed,
  expanded = false,
  highlight = false,
}: {
  tool: Tool;
  justUsed: boolean;
  expanded?: boolean;
  highlight?: boolean;
}) {
  const created = new Date(tool.created_at * 1000).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  if (!expanded) {
    return (
      <motion.div
        layout
        variants={materialize}
        initial="hidden"
        animate="visible"
        className={cn(
          "rounded-xl border bg-panel/90 p-4 shadow-panel backdrop-blur-sm",
          justUsed
            ? "border-reuse/40 shadow-glow-reuse"
            : "border-white/[0.08] hover:border-white/[0.12]"
        )}
      >
        <motion.div variants={reusePulse} animate={justUsed ? "pulse" : "idle"}>
          <div className="flex items-center justify-between gap-2">
            <span className="font-mono text-sm text-accent">{tool.name}</span>
            <span className="shrink-0 rounded-full bg-reuse/10 px-2 py-0.5 text-[10px] text-reuse">
              used {tool.usage_count}x
            </span>
          </div>
          <p className="mt-2 line-clamp-2 text-xs text-slate-400">{tool.description}</p>
          <div className="mt-3 flex items-center justify-between gap-2">
            <code className="truncate text-[10px] text-slate-600">{tool.signature}</code>
            <a
              href={exportToolUrl(tool.id)}
              className="shrink-0 text-[10px] text-slate-400 underline hover:text-accent"
            >
              export .py
            </a>
          </div>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div
      layout
      variants={materialize}
      initial="hidden"
      animate="visible"
      className={cn(
        "flex flex-col rounded-xl border bg-panel/90 p-4 shadow-panel backdrop-blur-sm transition-colors",
        highlight
          ? "border-reuse/50 shadow-glow-reuse"
          : justUsed
            ? "border-reuse/40 shadow-glow-reuse"
            : "border-white/[0.08] hover:border-accent/25"
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <span className="min-w-0 truncate font-mono text-sm font-semibold text-accent">
          {tool.name}
        </span>
        <span
          className={cn(
            "shrink-0 rounded-md border px-2 py-0.5 text-[10px]",
            highlight
              ? "border-reuse/30 bg-reuse/10 text-reuse"
              : "border-white/[0.08] bg-base/60 text-slate-400"
          )}
        >
          used {tool.usage_count}x
        </span>
      </div>

      <p className="mt-2 line-clamp-2 min-h-[32px] text-xs leading-relaxed text-slate-400">
        {tool.description}
      </p>

      <code className="mt-3 block w-fit max-w-full truncate rounded-md border border-white/[0.06] bg-base/60 px-2.5 py-1.5 font-mono text-[10.5px] text-slate-300">
        {shortSignature(tool)}
      </code>

      <div className="mt-3 flex items-center justify-between gap-2 border-t border-white/[0.05] pt-3">
        <span className="flex items-center gap-1.5 text-[10px] text-slate-500">
          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
          </svg>
          Created {created}
        </span>
        <a
          href={exportToolUrl(tool.id)}
          className="flex shrink-0 items-center gap-1 text-[10px] font-medium text-accent hover:text-accent/80"
        >
          export .py
          <svg className="h-2.5 w-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
          </svg>
        </a>
      </div>

      {tool.code && <CodePreview code={tool.code} className="mt-3" />}
    </motion.div>
  );
}
