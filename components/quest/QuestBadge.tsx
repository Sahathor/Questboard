import { cn } from "@/lib/utils";
import type { QuestType, Difficulty } from "@/lib/types";

// ─── Quest Type Badge ─────────────────────────────────────

interface QuestTypeBadgeProps {
  type: QuestType;
  className?: string;
}

const TYPE_LABELS: Record<QuestType, string> = {
  MAIN: "Main Quest",
  SIDE: "Side Quest",
  DAILY: "Daily",
};

const TYPE_STYLES: Record<QuestType, string> = {
  MAIN: "text-amber-400 bg-amber-400/10 border-amber-400/20",
  SIDE: "text-sky-400 bg-sky-400/10 border-sky-400/20",
  DAILY: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
};

export function QuestTypeBadge({ type, className }: QuestTypeBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border",
        TYPE_STYLES[type],
        className
      )}
    >
      {TYPE_LABELS[type]}
    </span>
  );
}

// ─── Difficulty Badge ─────────────────────────────────────

interface DifficultyBadgeProps {
  difficulty: Difficulty;
  className?: string;
}

const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  EASY: "Easy",
  MEDIUM: "Medium",
  HARD: "Hard",
  EPIC: "Epic",
};

const DIFFICULTY_STYLES: Record<Difficulty, string> = {
  EASY: "text-emerald-400",
  MEDIUM: "text-yellow-400",
  HARD: "text-orange-400",
  EPIC: "text-purple-400",
};

export function DifficultyBadge({
  difficulty,
  className,
}: DifficultyBadgeProps) {
  return (
    <span
      className={cn(
        "text-xs font-medium",
        DIFFICULTY_STYLES[difficulty],
        className
      )}
    >
      {DIFFICULTY_LABELS[difficulty]}
    </span>
  );
}