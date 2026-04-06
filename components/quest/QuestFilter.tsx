"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

const TYPE_OPTIONS = [
  { label: "Alle", value: "ALL" },
  { label: "Main Quest", value: "MAIN" },
  { label: "Side Quest", value: "SIDE" },
  { label: "Daily", value: "DAILY" },
];

const STATUS_OPTIONS = [
  { label: "Alle", value: "ALL" },
  { label: "Aktiv", value: "ACTIVE" },
  { label: "Abgeschlossen", value: "COMPLETED" },
];

interface QuestFilterProps {
  activeType?: string;
  activeStatus?: string;
}

export function QuestFilter({ activeType, activeStatus }: QuestFilterProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function setParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "ALL") {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    router.push(`${pathname}?${params.toString()}`);
  }

  const currentType = activeType ?? "ALL";
  const currentStatus = activeStatus ?? "ALL";

  return (
    <div className="flex flex-col gap-3">
      {/* Type Filter */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs text-zinc-600 uppercase tracking-wider w-12">
          Typ
        </span>
        {TYPE_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setParam("type", opt.value)}
            className={cn(
              "px-3 py-1 rounded-md text-xs font-medium border transition-colors",
              currentType === opt.value
                ? "bg-zinc-800 border-zinc-600 text-zinc-100"
                : "border-zinc-800 text-zinc-500 hover:text-zinc-300 hover:border-zinc-700"
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Status Filter */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs text-zinc-600 uppercase tracking-wider w-12">
          Status
        </span>
        {STATUS_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setParam("status", opt.value)}
            className={cn(
              "px-3 py-1 rounded-md text-xs font-medium border transition-colors",
              currentStatus === opt.value
                ? "bg-zinc-800 border-zinc-600 text-zinc-100"
                : "border-zinc-800 text-zinc-500 hover:text-zinc-300 hover:border-zinc-700"
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}