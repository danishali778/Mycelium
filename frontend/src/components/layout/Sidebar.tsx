"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MyceliumLogo } from "@/components/brand/MyceliumLogo";
import { PackSelector } from "@/components/input/PackSelector";
import { MyceliumPattern } from "@/components/ui/MyceliumPattern";
import { useCockpit } from "@/context/CockpitContext";
import { cn } from "@/lib/utils";

const NAV = [
  {
    href: "/",
    label: "Workspace",
    icon: (
      <svg className="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
      </svg>
    ),
  },
  {
    href: "/tools",
    label: "Tools",
    icon: (
      <svg className="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03a2.652 2.652 0 00-3.802-3.803l-3.03 2.496M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l5.653-4.655" />
      </svg>
    ),
  },
  {
    href: "/memory",
    label: "Memory",
    icon: (
      <svg className="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z" />
      </svg>
    ),
  },
  {
    href: "/workflows",
    label: "Workflows",
    icon: (
      <svg className="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
      </svg>
    ),
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { packId, setPackId, sourceRef, sessions, tools, workflows } = useCockpit();

  return (
    <aside className="relative flex w-[240px] shrink-0 flex-col border-r border-white/[0.06] bg-panel/95">
      <MyceliumPattern className="opacity-[0.04]" />
      <div className="relative z-10 border-b border-white/[0.06] px-5 py-6">
        <MyceliumLogo />
      </div>

      <nav className="relative z-10 space-y-1 px-3 py-5">
        {NAV.map((item) => {
          const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all",
                active
                  ? "bg-accent/12 text-accent shadow-[inset_0_0_0_1px_rgba(94,234,212,0.2)]"
                  : "text-slate-400 hover:bg-white/[0.04] hover:text-slate-200"
              )}
            >
              {item.icon}
              <span className="font-medium">{item.label}</span>
              {item.href === "/tools" && tools.length > 0 && (
                <span className="ml-auto rounded-full bg-white/5 px-2 py-0.5 text-[10px] text-slate-500">
                  {tools.length}
                </span>
              )}
              {item.href === "/workflows" && workflows.length > 0 && (
                <span className="ml-auto rounded-full bg-white/5 px-2 py-0.5 text-[10px] text-slate-500">
                  {workflows.length}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="relative z-10 min-h-0 flex-1 border-t border-white/[0.06] px-3 py-4">
        <div className="mb-3 flex items-center justify-between px-2">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-600">
            Sessions
          </p>
          <span className="rounded-full bg-white/[0.04] px-2 py-0.5 text-[10px] text-slate-600">
            {sessions.length}
          </span>
        </div>
        <div className="scrollbar-thin max-h-full space-y-2 overflow-y-auto pr-1">
          {sessions.length === 0 ? (
            <p className="rounded-xl border border-dashed border-white/[0.08] px-3 py-4 text-xs leading-relaxed text-slate-600">
              Connected CSVs appear here so every run feels like part of a workspace.
            </p>
          ) : (
            sessions.map((session) => {
              const active = session.sourceRef === sourceRef;
              return (
                <div
                  key={session.id}
                  className={cn(
                    "rounded-xl border px-3 py-2.5 transition-colors",
                    active
                      ? "border-accent/25 bg-accent/[0.08]"
                      : "border-white/[0.06] bg-base/30"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        "h-1.5 w-1.5 shrink-0 rounded-full",
                        active ? "bg-accent" : "bg-slate-700"
                      )}
                    />
                    <p className="truncate text-xs font-medium text-slate-300">
                      {session.filename}
                    </p>
                  </div>
                  <p className="mt-1.5 text-[10px] text-slate-600">
                    {session.rows} rows / {session.columns} cols
                  </p>
                  {session.lastGoal && (
                    <p className="mt-2 line-clamp-2 text-[10px] leading-relaxed text-slate-500">
                      {session.lastGoal}
                    </p>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      <div className="relative z-10 border-t border-white/[0.06] px-4 py-5">
        <p className="mb-2.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-600">
          Data Pack
        </p>
        <PackSelector value={packId} onChange={setPackId} />
      </div>

      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-accent/[0.06] to-transparent" />
    </aside>
  );
}
