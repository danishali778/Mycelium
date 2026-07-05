"use client";

import { useEffect, useRef } from "react";
import type { RunEvent } from "@/lib/types";
import { EventMarker } from "@/components/reasoning/EventMarkers";
import { Panel } from "@/components/ui/Panel";

export function ReasoningStream({
  events,
  running,
}: {
  events: RunEvent[];
  running?: boolean;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [events.length, running]);

  return (
    <Panel
      title="Reasoning Stream"
      pattern
      className="min-h-0"
      bodyClassName="min-h-0 overflow-hidden p-0"
      noPadding
      badge={
        running ? (
          <span className="flex items-center gap-1.5 text-[10px] text-accent">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent" />
            live
          </span>
        ) : null
      }
    >
      <div
        ref={scrollRef}
        className="scrollbar-thin min-h-0 flex-1 overflow-y-auto overflow-x-hidden"
      >
        <div className="min-w-0 px-2 py-2 font-mono">
          {events.length === 0 && (
            <div className="flex min-h-[220px] flex-col justify-center rounded-lg border border-dashed border-white/10 bg-base/30 px-4 text-center">
              <p className="text-sm text-slate-500">No reasoning trace yet.</p>
              <p className="mt-2 text-xs leading-relaxed text-slate-700">
                Upload a CSV and run a task to watch profile, planning, memory reuse, execution,
                and result synthesis.
              </p>
            </div>
          )}
          {events.map((ev, i) => (
            <EventMarker key={i} event={ev} />
          ))}
          {running && (
            <div className="flex items-center gap-2 px-1.5 py-2">
              <span className="flex gap-1">
                <span className="h-1 w-1 animate-pulse rounded-full bg-accent" />
                <span className="h-1 w-1 animate-pulse rounded-full bg-accent [animation-delay:150ms]" />
                <span className="h-1 w-1 animate-pulse rounded-full bg-accent [animation-delay:300ms]" />
              </span>
              <span className="font-mono text-[10px] text-slate-600">Streaming events...</span>
            </div>
          )}
        </div>
      </div>
    </Panel>
  );
}
