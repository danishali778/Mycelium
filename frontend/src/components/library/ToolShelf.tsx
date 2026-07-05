"use client";

import { AnimatePresence } from "framer-motion";
import { useMemo } from "react";
import type { RunEvent, Tool } from "@/lib/types";
import { ToolCard } from "@/components/library/ToolCard";

export function ToolShelf({
  tools,
  events,
}: {
  tools: Tool[];
  events: RunEvent[];
}) {
  // Names of tools reused in this run (for the pulse animation).
  const reusedNames = useMemo(() => {
    return new Set(
      events
        .filter((e) => e.type === "tool.matched" || e.type === "tool.called")
        .map((e) => e.data?.name as string)
        .filter(Boolean)
    );
  }, [events]);

  return (
    <section className="flex max-h-[45%] flex-col overflow-hidden border-t border-white/5 bg-base">
      <h2 className="px-4 py-2 text-xs font-semibold uppercase tracking-widest text-slate-500">
        Tool Library {tools.length > 0 && `(${tools.length})`}
      </h2>
      <div className="flex-1 space-y-2 overflow-y-auto px-3 pb-4">
        {tools.length === 0 && (
          <p className="px-1 py-4 text-sm text-slate-600">
            Empty. Mycelium knows nothing yet - watch it grow tools as you ask.
          </p>
        )}
        <AnimatePresence>
          {tools.map((tool) => (
            <ToolCard
              key={tool.id}
              tool={tool}
              justUsed={reusedNames.has(tool.name)}
            />
          ))}
        </AnimatePresence>
      </div>
    </section>
  );
}
