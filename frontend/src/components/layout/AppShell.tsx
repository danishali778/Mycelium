"use client";

import { CockpitProvider } from "@/context/CockpitContext";
import { Sidebar } from "@/components/layout/Sidebar";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <CockpitProvider>
      <div className="flex h-screen overflow-hidden bg-base">
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">{children}</div>
      </div>
    </CockpitProvider>
  );
}
