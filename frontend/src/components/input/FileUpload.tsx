"use client";

import { useState } from "react";
import { uploadFile } from "@/lib/api";
import type { SourceProfile } from "@/lib/types";
import { cn } from "@/lib/utils";

export function FileUpload({
  onUploaded,
  compact = false,
  sourceProfile = null,
}: {
  onUploaded: (sourceRef: string, profile: SourceProfile) => void;
  compact?: boolean;
  sourceProfile?: SourceProfile | null;
}) {
  const [name, setName] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const displayName = sourceProfile?.filename ?? name;
  const connected = !!displayName && displayName !== "upload failed";

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    try {
      const res = await uploadFile(file);
      onUploaded(res.source_ref, res.source_profile);
      setName(res.filename);
    } catch {
      setName("upload failed");
    } finally {
      setBusy(false);
    }
  }

  if (compact) {
    return (
      <label
        className={cn(
          "flex shrink-0 cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors",
          connected
            ? "bg-accent/10 text-accent hover:bg-accent/15"
            : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
        )}
      >
        <input type="file" accept=".csv" className="hidden" onChange={handleChange} />
        <svg className="h-4 w-4 shrink-0 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
        </svg>
        <span className="max-w-[180px] truncate">
          {busy ? "Uploading..." : connected ? displayName : "Connect CSV"}
        </span>
        {connected && (
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-accent/20 text-accent">
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </span>
        )}
      </label>
    );
  }

  return (
    <label
      className={cn(
        "cursor-pointer rounded-xl border px-4 py-2.5 text-sm transition-all",
        connected
          ? "border-accent/30 bg-accent/10 text-accent shadow-glow-sm hover:border-accent/50"
          : "border-white/[0.08] bg-panel text-slate-300 hover:border-accent/30"
      )}
    >
      <input type="file" accept=".csv" className="hidden" onChange={handleChange} />
      {busy ? "Uploading..." : connected ? `${displayName} connected` : "Connect CSV source"}
    </label>
  );
}
