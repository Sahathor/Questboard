import { getCharacter } from "@/actions/character.actions";
import { getQuests } from "@/actions/quest.actions";
import { XPBar } from "@/components/character/XPBar";
import { StatBlock } from "@/components/character/StatBlock";
import { SkillGrid } from "@/components/character/SkillGrid";
import { Separator } from "@/components/ui/separator";
import { Swords, Flame, Coins, Star, CheckCircle2 } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function CharacterPage() {
  const [characterResult, questsResult] = await Promise.all([
    getCharacter(),
    getQuests(),
  ]);

  const character = characterResult.success ? characterResult.data : null;
  const quests = questsResult.success ? questsResult.data : [];

  if (!character) {
    return (
      <div className="text-center py-16">
        <p className="text-zinc-500 text-sm">Character konnte nicht geladen werden.</p>
      </div>
    );
  }

  const completedQuests = quests.filter((q) => q.status === "COMPLETED");
  const xpProgress = Math.round((character.xp / character.xpToNext) * 100);

  return (
    <div className="space-y-8 max-w-2xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-zinc-100">
          <span className="text-gold">{character.name}</span>
        </h1>
        <p className="text-sm text-zinc-500 mt-1">
          Level {character.level} · {completedQuests.length} Quests abgeschlossen
        </p>
      </div>

      {/* XP Progress */}
      <div className="space-y-2 px-4 py-4 rounded-lg bg-zinc-900 border border-zinc-800">
        <div className="flex items-center justify-between text-xs text-zinc-500">
          <div className="flex items-center gap-1.5">
            <Swords className="w-3.5 h-3.5 text-gold" />
            <span>Level {character.level}</span>
          </div>
          <span>
            {character.xp} / {character.xpToNext} XP
          </span>
        </div>
        <XPBar
          xp={character.xp}
          xpToNext={character.xpToNext}
          progress={xpProgress}
        />
        <p className="text-xs text-zinc-600">
          Noch {character.xpToNext - character.xp} XP bis Level {character.level + 1}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatBlock
          icon={<Star className="w-4 h-4 text-gold" />}
          label="Level"
          value={character.level.toString()}
        />
        <StatBlock
          icon={<Coins className="w-4 h-4 text-yellow-400" />}
          label="Gold"
          value={character.gold.toString()}
        />
        <StatBlock
          icon={<Flame className="w-4 h-4 text-orange-400" />}
          label="Streak"
          value={`${character.streak} Tage`}
        />
        <StatBlock
          icon={<CheckCircle2 className="w-4 h-4 text-emerald-400" />}
          label="Abgeschlossen"
          value={completedQuests.length.toString()}
        />
      </div>

      <Separator className="bg-zinc-800" />

      {/* Skills */}
      <div className="space-y-3">
        <h2 className="text-sm font-medium text-zinc-400 uppercase tracking-wider">
          Skills
        </h2>
        <SkillGrid skills={character.skills} />
      </div>
    </div>
  );
}