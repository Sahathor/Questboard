import { Suspense } from "react";
import { getQuests } from "@/actions/quest.actions";
import { QuestCard } from "@/components/quest/QuestCard";
import { QuestFilter } from "@/components/quest/QuestFilter";
import { Button } from "@/components/ui/button";
import { Plus, Scroll } from "lucide-react";
import Link from "next/link";

interface QuestsPageProps {
  searchParams: Promise<{
    type?: string;
    status?: string;
  }>;
}

export default async function QuestsPage({ searchParams }: QuestsPageProps) {
  const { type, status } = await searchParams;
  const result = await getQuests();
  const allQuests = result.success ? result.data : [];

  const filtered = allQuests.filter((q) => {
    const typeMatch = !type || type === "ALL" || q.type === type;
    const statusMatch = !status || status === "ALL" || q.status === status;
    return typeMatch && statusMatch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-100">Quests</h1>
          <p className="text-sm text-zinc-500 mt-1">
            {allQuests.length === 0
              ? "Noch keine Quests vorhanden."
              : `${allQuests.length} ${allQuests.length === 1 ? "Quest" : "Quests"} insgesamt`}
          </p>
        </div>
        <Link href="/quests/new">
          <Button className="bg-gold text-zinc-950 hover:bg-amber-400 font-medium gap-2">
            <Plus className="w-4 h-4" />
            Neue Quest
          </Button>
        </Link>
      </div>

      {/* Filter – Suspense required für useSearchParams() */}
      <Suspense fallback={<div className="h-16 rounded-lg bg-zinc-900 animate-pulse" />}>
        <QuestFilter activeType={type} activeStatus={status} />
      </Suspense>

      {/* Liste */}
      {filtered.length > 0 ? (
        <div className="space-y-2">
          {filtered.map((quest) => (
            <QuestCard key={quest.id} quest={quest} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 space-y-3">
          <Scroll className="w-10 h-10 text-zinc-700 mx-auto" />
          <p className="text-zinc-500 text-sm">
            {allQuests.length === 0
              ? "Erstelle deine erste Quest."
              : "Keine Quests für diesen Filter."}
          </p>
          {allQuests.length === 0 && (
            <Link href="/quests/new">
              <Button
                variant="outline"
                className="border-zinc-700 text-zinc-400 hover:text-zinc-100 mt-2"
              >
                Quest erstellen
              </Button>
            </Link>
          )}
        </div>
      )}
    </div>
  );
}