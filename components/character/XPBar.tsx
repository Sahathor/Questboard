import { cn } from "@/lib/utils";

interface XPBarProps {
  xp: number;
  xpToNext: number;
  progress: number; // 0–100
  className?: string;
}

export function XPBar({ progress, className }: XPBarProps) {
  return (
    <div
      className={cn(
        "flex-1 h-2 bg-zinc-800 rounded-full overflow-hidden",
        className
      )}
    >
      <div
        className="h-full bg-gold rounded-full transition-all duration-500"
        style={{ width: `${Math.min(progress, 100)}%` }}
      />
    </div>
  );
}