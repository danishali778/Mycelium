import Link from "next/link";
import { cn } from "@/lib/utils";

export function MyceliumLogo({
  className,
  showWordmark = true,
  size = "md",
}: {
  className?: string;
  showWordmark?: boolean;
  size?: "sm" | "md" | "lg";
}) {
  const iconSize = size === "sm" ? 28 : size === "lg" ? 40 : 34;

  return (
    <Link href="/" className={cn("flex items-center gap-3", className)}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/brand/logo-icon.svg"
        alt=""
        width={iconSize}
        height={iconSize}
        className="shrink-0 drop-shadow-[0_0_12px_rgba(94,234,212,0.45)]"
      />
      {showWordmark && (
        <span className="text-xl font-semibold tracking-tight text-white">Mycelium</span>
      )}
    </Link>
  );
}
