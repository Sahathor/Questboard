import { cn } from "@/lib/utils";

interface StatBlockProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  className?: string;
}

export function StatBlock({ icon, label, value, className }: StatBlockProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 px-4 py-3 rounded-lg bg-zinc-900 border border-zinc-800",
        className
      )}
    >
      <div className="shrink-0">{icon}</div>
      <div className="min-w-0">
        <p className="text-xs text-zinc-500 uppercase tracking-wider">
          {label}
        </p>
        <p className="text-sm font-semibold text-zinc-100 truncate">{value}</p>
      </div>
    </div>
  );
}