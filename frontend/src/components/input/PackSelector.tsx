"use client";

import { useEffect, useState } from "react";
import { fetchPacks } from "@/lib/api";
import type { Pack } from "@/lib/types";

export function PackSelector({
  value,
  onChange,
}: {
  value: string;
  onChange: (id: string) => void;
}) {
  const [packs, setPacks] = useState<Pack[]>([{ id: "data", label: "Data Analyst" }]);

  useEffect(() => {
    fetchPacks()
      .then((p) => p.length && setPacks(p))
      .catch(() => {});
  }, []);

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-lg border border-white/[0.08] bg-base px-3 py-2 text-sm text-slate-200 outline-none focus:border-accent/40"
    >
      {packs.map((p) => (
        <option key={p.id} value={p.id}>
          {p.label}
        </option>
      ))}
    </select>
  );
}
