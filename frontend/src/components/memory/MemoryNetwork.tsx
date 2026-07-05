"use client";

import type { Tool } from "@/lib/types";

export function MemoryNetwork({ tools }: { tools: Tool[] }) {
  if (tools.length === 0) {
    return (
      <div className="flex min-h-[280px] items-center justify-center rounded-xl border border-white/[0.08] bg-panel/90 p-6 shadow-panel">
        <p className="text-sm text-slate-600">
          The mycelial network grows as tools are created and connected.
        </p>
      </div>
    );
  }

  const maxUsage = Math.max(...tools.map((t) => t.usage_count), 1);
  const cx = 200;
  const cy = 160;
  const radius = 120;

  const nodes = tools.slice(0, 12).map((tool, i) => {
    const angle = (i / Math.min(tools.length, 12)) * Math.PI * 2 - Math.PI / 2;
    const x = cx + Math.cos(angle) * radius;
    const y = cy + Math.sin(angle) * radius;
    const r = 8 + (tool.usage_count / maxUsage) * 16;
    const isHot = tool.usage_count >= 2;
    return { tool, x, y, r, isHot };
  });

  return (
    <div className="rounded-xl border border-white/[0.08] bg-panel/90 p-5 shadow-panel backdrop-blur-sm">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-300">Capability network</h3>
        <div className="flex gap-3 text-[10px] text-slate-500">
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-accent" /> created
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-reuse" /> reused
          </span>
        </div>
      </div>
      <svg viewBox="0 0 400 320" className="w-full" aria-hidden>
        {nodes.map((a, i) =>
          nodes.slice(i + 1).map((b) => (
            <line
              key={`${a.tool.id}-${b.tool.id}`}
              x1={a.x}
              y1={a.y}
              x2={b.x}
              y2={b.y}
              stroke="rgba(94,234,212,0.12)"
              strokeWidth={1}
            />
          ))
        )}
        {nodes.map(({ tool, x, y, r, isHot }) => (
          <g key={tool.id}>
            <circle
              cx={x}
              cy={y}
              r={r + 4}
              fill={isHot ? "rgba(167,139,250,0.15)" : "rgba(94,234,212,0.1)"}
            />
            <circle
              cx={x}
              cy={y}
              r={r}
              fill={isHot ? "#a78bfa" : "#5eead4"}
              opacity={0.85}
            />
            <text
              x={x}
              y={y + r + 14}
              textAnchor="middle"
              fill="#94a3b8"
              fontSize={9}
              fontFamily="monospace"
            >
              {tool.name.length > 14 ? `${tool.name.slice(0, 12)}...` : tool.name}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}
