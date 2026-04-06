import { cn } from "@/lib/utils";
import type { Skills, SkillType } from "@/lib/types";

interface SkillGridProps {
  skills: Skills[];
  className?: string;
}

const SKILL_LABELS: Record<SkillType, string> = {
  FOCUS:       "Focus",
  DISCIPLINE:  "Discipline",
  CREATIVITY:  "Creativity",
  ENDURANCE:   "Endurance",
};

const SKILL_DESCRIPTIONS: Record<SkillType, string> = {
  FOCUS:      "Konzentration und Tiefenarbeit",
  DISCIPLINE: "Konsequenz und Durchhaltevermögen",
  CREATIVITY: "Ideen und kreative Problemlösung",
  ENDURANCE:  "Ausdauer bei langen Aufgaben",
};

const SKILL_COLORS: Record<SkillType, string> = {
  FOCUS:      "text-sky-400",
  DISCIPLINE: "text-amber-400",
  CREATIVITY: "text-purple-400",
  ENDURANCE:  "text-emerald-400",
};

const SKILL_BAR_COLORS: Record<SkillType, string> = {
  FOCUS:      "bg-sky-400",
  DISCIPLINE: "bg-amber-400",
  CREATIVITY: "bg-purple-400",
  ENDURANCE:  "bg-emerald-400",
};

export function SkillGrid({ skills, className }: SkillGridProps) {
  if (skills.length === 0) {
    return (
      <p className="text-sm text-zinc-600">Noch keine Skills vorhanden.</p>
    );
  }

  return (
    <div className={cn("grid grid-cols-1 gap-3 sm:grid-cols-2", className)}>
      {skills.map((skill) => {
        const progress = Math.round((skill.xp / skill.xpToNext) * 100);

        return (
          <div
            key={skill.id}
            className="px-4 py-4 rounded-lg bg-zinc-900 border border-zinc-800 space-y-3"
          >
            {/* Skill Header */}
            <div className="flex items-center justify-between">
              <div>
                <p
                  className={cn(
                    "text-sm font-medium",
                    SKILL_COLORS[skill.type]
                  )}
                >
                  {SKILL_LABELS[skill.type]}
                </p>
                <p className="text-xs text-zinc-600 mt-0.5">
                  {SKILL_DESCRIPTIONS[skill.type]}
                </p>
              </div>
              <span className="text-xs font-semibold text-zinc-400 bg-zinc-800 px-2 py-0.5 rounded-md">
                Lvl {skill.level}
              </span>
            </div>

            {/* Skill XP Bar */}
            <div className="space-y-1">
              <div
                className="h-1.5 bg-zinc-800 rounded-full overflow-hidden"
              >
                <div
                  className={cn(
                    "h-full rounded-full transition-all duration-500",
                    SKILL_BAR_COLORS[skill.type]
                  )}
                  style={{ width: `${Math.min(progress, 100)}%` }}
                />
              </div>
              <p className="text-xs text-zinc-600 text-right">
                {skill.xp} / {skill.xpToNext} XP
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}