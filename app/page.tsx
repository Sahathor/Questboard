import { getCharacter } from "@/actions/character.actions";
import { getQuests, getCompletedToday } from "@/actions/quest.actions";
import { XPBar } from "@/components/character/XPBar";
import { StatBlock } from "@/components/character/StatBlock";
import { QuestCard } from "@/components/quest/QuestCard";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Swords, Flame, Coins, Star, Plus } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [characterResult, questsResult, completedTodayResult] =
    await Promise.all([getCharacter(), getQuests(), getCompletedToday()]);

  const character = characterResult.success ? characterResult.data : null;
  const allQuests = questsResult.success ? questsResult.data : [];
  const completedToday = completedTodayResult.success
    ? completedTodayResult.data
    : 0;

  const activeQuests = allQuests.filter((q) => q.status === "ACTIVE");
  const todayQuests = activeQuests.filter((q) => q.type === "DAILY");
  const mainAndSide = activeQuests.filter((q) => q.type !== "DAILY");

  const xpProgress = character
    ? Math.round((character.xp / character.xpToNext) * 100)
    : 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-100">
            Willkommen zurück,{" "}
            <span className="text-gold">{character?.name ?? "Hero"}</span>
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            {activeQuests.length === 0
              ? "Keine aktiven Quests – erstelle deine erste Quest."
              : `${activeQuests.length} aktive ${activeQuests.length === 1 ? "Quest" : "Quests"} warten auf dich.`}
          </p>
        </div>
        <Link href="/quests/new">
          <Button className="bg-gold text-zinc-950 hover:bg-amber-400 font-medium gap-2">
            <Plus className="w-4 h-4" />
            Neue Quest
          </Button>
        </Link>
      </div>

      {/* Character Stats */}
      {character && (
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Swords className="w-4 h-4 text-gold" />
              <span className="text-sm font-medium text-zinc-400">
                Level {character.level}
              </span>
            </div>
            <XPBar
              xp={character.xp}
              xpToNext={character.xpToNext}
              progress={xpProgress}
            />
            <span className="text-xs text-zinc-500 whitespace-nowrap">
              {character.xp} / {character.xpToNext} XP
            </span>
          </div>

          <div className="grid grid-cols-3 gap-4">
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
          </div>
        </div>
      )}

      <Separator className="bg-zinc-800" />

      {/* Daily Quests */}
      {todayQuests.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-medium text-zinc-400 uppercase tracking-wider">
            Daily Quests
          </h2>
          <div className="space-y-2">
            {todayQuests.map((quest) => (
              <QuestCard key={quest.id} quest={quest} />
            ))}
          </div>
        </div>
      )}

      {/* Main & Side Quests */}
      {mainAndSide.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-medium text-zinc-400 uppercase tracking-wider">
            Aktive Quests
          </h2>
          <div className="space-y-2">
            {mainAndSide.map((quest) => (
              <QuestCard key={quest.id} quest={quest} />
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {activeQuests.length === 0 && (
        <div className="text-center py-16 space-y-3">
          <Swords className="w-10 h-10 text-zinc-700 mx-auto" />
          <p className="text-zinc-500 text-sm">
            Dein Questboard ist leer.
          </p>
          <Link href="/quests/new">
            <Button variant="outline" className="border-zinc-700 text-zinc-400 hover:text-zinc-100 mt-2">
              Erste Quest erstellen
            </Button>
          </Link>
        </div>
      )}

      {/* Footer Stats */}
      {completedToday > 0 && (
        <div className="text-xs text-zinc-600 text-right">
          Heute abgeschlossen: {completedToday}{" "}
          {completedToday === 1 ? "Quest" : "Quests"}
        </div>
      )}
    </div>
  );
}