"use client";

import { FileUpload } from "@/components/input/FileUpload";
import { GoalInput } from "@/components/input/GoalInput";
import type { SourceProfile } from "@/lib/types";

export function CommandBar({
  onUploaded,
  onSubmit,
  disabled,
  disabledLabel,
  placeholder,
  sourceProfile,
}: {
  onUploaded: (ref: string, profile: SourceProfile) => void;
  onSubmit: (goal: string) => void;
  disabled?: boolean;
  disabledLabel?: string;
  placeholder?: string;
  sourceProfile: SourceProfile | null;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-white/[0.08] bg-panel/80 p-2 shadow-panel backdrop-blur-sm">
      <FileUpload onUploaded={onUploaded} compact sourceProfile={sourceProfile} />
      <div className="h-8 w-px shrink-0 bg-white/10" />
      <GoalInput
        onSubmit={onSubmit}
        disabled={disabled}
        disabledLabel={disabledLabel}
        placeholder={placeholder}
        embedded
      />
    </div>
  );
}
