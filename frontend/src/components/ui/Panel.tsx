import { cn } from "@/lib/utils";
import { MyceliumPattern } from "@/components/ui/MyceliumPattern";

export function Panel({
  title,
  badge,
  children,
  className,
  bodyClassName,
  pattern = false,
  noPadding = false,
}: {
  title?: string;
  badge?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  bodyClassName?: string;
  pattern?: boolean;
  noPadding?: boolean;
}) {
  return (
    <section
      className={cn(
        "relative flex min-h-0 flex-col overflow-hidden rounded-xl",
        "border border-white/[0.08] bg-panel/90 shadow-panel backdrop-blur-sm",
        className
      )}
    >
      {pattern && <MyceliumPattern />}
      {(title || badge) && (
        <header className="relative z-10 flex items-center justify-between border-b border-white/[0.06] px-4 py-3">
          {title && (
            <h2 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
              {title}
            </h2>
          )}
          {badge}
        </header>
      )}
      <div
        className={cn(
          "relative z-10 flex min-h-0 flex-1 flex-col",
          !noPadding && "p-4",
          bodyClassName
        )}
      >
        {children}
      </div>
    </section>
  );
}
