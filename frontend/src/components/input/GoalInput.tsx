"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

export function GoalInput({
  onSubmit,
  disabled,
  disabledLabel,
  placeholder,
  embedded = false,
}: {
  onSubmit: (goal: string) => void;
  disabled?: boolean;
  disabledLabel?: string;
  placeholder?: string;
  embedded?: boolean;
}) {
  const [goal, setGoal] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!goal.trim() || disabled) return;
    onSubmit(goal.trim());
  }

  return (
    <form onSubmit={submit} className="flex min-w-0 flex-1 items-center gap-2">
      <input
        value={goal}
        onChange={(e) => setGoal(e.target.value)}
        placeholder={placeholder ?? "Ask Mycelium something about your data..."}
        disabled={disabled}
        className={cn(
          "min-w-0 flex-1 bg-transparent text-sm text-slate-200 outline-none placeholder:text-slate-600 disabled:opacity-50",
          !embedded && "rounded-lg border border-white/[0.08] bg-base px-4 py-2.5 focus:border-accent/40"
        )}
      />
      <button
        type="submit"
        disabled={disabled}
        className={cn(
          "flex shrink-0 items-center gap-2 rounded-lg px-5 py-2 text-sm font-semibold transition-all",
          "bg-accent text-base shadow-glow-sm hover:bg-accent/90 disabled:opacity-40",
          embedded && "py-2"
        )}
      >
        {!disabled && (
          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
          </svg>
        )}
        {disabled ? disabledLabel ?? "Working..." : "Run"}
      </button>
    </form>
  );
}
