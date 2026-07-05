"use client";

import type { SourceProfile } from "@/lib/types";

export function SourceProfileCard({ profile }: { profile: SourceProfile | null }) {
  if (!profile) return null;
  const visibleColumns = profile.columns.slice(0, 8);
  const hiddenCount = Math.max(0, profile.columns.length - visibleColumns.length);

  return (
    <div className="flex min-w-0 items-center gap-3 rounded-lg border border-white/10 bg-panel px-4 py-2 text-sm">
      <div className="min-w-0 shrink-0">
        <span className="block max-w-[260px] truncate font-medium text-accent">
          {profile.filename}
        </span>
        <span className="text-[10px] text-slate-500">
          {profile.row_count} rows / {profile.column_count} cols
        </span>
      </div>
      <div className="flex min-w-0 flex-1 items-center gap-1.5 overflow-hidden">
        {visibleColumns.map((col) => (
          <span
            key={col.name}
            className="shrink-0 rounded border border-white/5 bg-base px-2 py-0.5 text-xs text-slate-400"
            title={col.dirty_patterns.join(", ") || col.dtype}
          >
            {col.name}
            {col.dirty_patterns.length > 0 && (
              <span className="ml-1 text-amber-400">*</span>
            )}
          </span>
        ))}
        {hiddenCount > 0 && (
          <span className="shrink-0 rounded border border-white/5 bg-base px-2 py-0.5 text-xs text-slate-600">
            +{hiddenCount}
          </span>
        )}
      </div>
      {profile.warnings.length > 0 && (
        <p className="shrink-0 text-xs text-amber-400">{profile.warnings.join(" ")}</p>
      )}
    </div>
  );
}
