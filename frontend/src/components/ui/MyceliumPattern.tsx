import { cn } from "@/lib/utils";

export function MyceliumPattern({ className }: { className?: string }) {
  return (
    <svg
      className={cn("pointer-events-none absolute inset-0 h-full w-full opacity-[0.07]", className)}
      aria-hidden
    >
      <defs>
        <pattern id="mycelium-mesh" width="120" height="120" patternUnits="userSpaceOnUse">
          <circle cx="20" cy="20" r="1.5" fill="#5eead4" />
          <circle cx="80" cy="40" r="1.5" fill="#5eead4" />
          <circle cx="50" cy="90" r="1.5" fill="#a78bfa" />
          <line x1="20" y1="20" x2="80" y2="40" stroke="#5eead4" strokeWidth="0.5" />
          <line x1="80" y1="40" x2="50" y2="90" stroke="#5eead4" strokeWidth="0.5" />
          <line x1="50" y1="90" x2="20" y2="20" stroke="#a78bfa" strokeWidth="0.5" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#mycelium-mesh)" />
    </svg>
  );
}
