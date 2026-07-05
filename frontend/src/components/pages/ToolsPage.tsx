"use client";

import { useMemo, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { PageHeader } from "@/components/layout/PageHeader";
import { ToolCard } from "@/components/library/ToolCard";
import { useCockpit } from "@/context/CockpitContext";
import { cn } from "@/lib/utils";

type Filter = "all" | "most_used" | "recent";

const FILTERS: { id: Filter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "most_used", label: "Most used" },
  { id: "recent", label: "Recently created" },
];

export function ToolsPage() {
  const { tools, packId } = useCockpit();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<Filter>("all");

  const totalUses = useMemo(
    () => tools.reduce((sum, t) => sum + t.usage_count, 0),
    [tools]
  );

  const topUsedId = useMemo(() => {
    const top = [...tools].sort((a, b) => b.usage_count - a.usage_count)[0];
    return top && top.usage_count > 1 ? top.id : null;
  }, [tools]);

  const filtered = useMemo(() => {
    let list = [...tools];
    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q) ||
          t.signature.toLowerCase().includes(q)
      );
    }
    if (filter === "most_used") list.sort((a, b) => b.usage_count - a.usage_count);
    if (filter === "recent") list.sort((a, b) => b.created_at - a.created_at);
    return list;
  }, [tools, search, filter]);

  function exportAll() {
    if (tools.length === 0) return;
    const header = `"""Mycelium tool library export - ${tools.length} tools (${packId} pack)."""\n\n`;
    const body = tools
      .map((t) => `# --- ${t.name} - ${t.description}\n${t.code.trim()}`)
      .join("\n\n\n");
    const blob = new Blob([header + body + "\n"], { type: "text/x-python" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "mycelium_tools.py";
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <PageHeader
        title="Tools"
        subtitle="All registered capabilities - persistent across sessions"
      />

      <div className="flex flex-wrap items-center gap-3 px-6 pb-5">
        <div className="flex shrink-0 items-center gap-2 text-xs text-slate-500">
          <span>
            <span className="font-semibold text-accent">{tools.length}</span> tools
          </span>
          <span className="text-slate-700">·</span>
          <span>
            <span className="font-semibold text-slate-200">{totalUses}</span> total uses
          </span>
          <span className="text-slate-700">·</span>
          <span className="flex items-center gap-1.5 text-accent">
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
            </svg>
            <span className="capitalize">{packId} Pack</span>
          </span>
        </div>

        <div className="relative min-w-[200px] flex-1">
          <svg
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tools..."
            className="w-full rounded-xl border border-white/[0.08] bg-panel/80 py-2.5 pl-10 pr-4 text-sm text-slate-200 shadow-panel outline-none placeholder:text-slate-600 focus:border-accent/40"
          />
        </div>

        <div className="flex shrink-0 rounded-xl border border-white/[0.08] bg-panel/80 p-1 shadow-panel">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFilter(f.id)}
              className={cn(
                "rounded-lg px-3 py-1.5 text-xs transition-all",
                filter === f.id
                  ? "bg-accent/15 text-accent"
                  : "text-slate-500 hover:text-slate-300"
              )}
            >
              {f.label}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={exportAll}
          disabled={tools.length === 0}
          className="flex shrink-0 items-center gap-2 rounded-xl border border-accent/30 bg-accent/[0.06] px-4 py-2.5 text-xs font-medium text-accent shadow-panel transition-all hover:border-accent/50 hover:bg-accent/10 disabled:opacity-40"
        >
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M7.5 7.5L12 3m0 0l4.5 4.5M12 3v13.5" />
          </svg>
          Export all
        </button>
      </div>

      <div className="scrollbar-thin flex-1 overflow-y-auto px-6 pb-6">
        {filtered.length === 0 && tools.length > 0 ? (
          <div className="flex min-h-[280px] flex-col items-center justify-center rounded-xl border border-dashed border-white/10 bg-panel/50 px-6 text-center shadow-panel">
            <p className="text-sm text-slate-500">No tools match your search.</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <AnimatePresence>
              {filtered.map((tool) => (
                <ToolCard
                  key={tool.id}
                  tool={tool}
                  justUsed={false}
                  expanded
                  highlight={tool.id === topUsedId}
                />
              ))}
            </AnimatePresence>
          </div>
        )}

        <div className="mt-4 flex items-center justify-center gap-3 rounded-xl border border-dashed border-white/10 bg-panel/30 px-6 py-6">
          <span className="flex h-8 w-8 items-center justify-center rounded-full border border-accent/30 bg-accent/10 text-accent">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
          </span>
          <p className="text-sm text-slate-500">
            Tools materialize here when Mycelium synthesizes new capabilities
          </p>
        </div>
      </div>
    </div>
  );
}
