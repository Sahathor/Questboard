import { getQuestById } from "@/actions/quest.actions";
import { QuestEditForm } from "@/components/quest/QuestEditForm";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

interface QuestDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function QuestDetailPage({
  params,
}: QuestDetailPageProps) {
  const { id } = await params;
  const result = await getQuestById(id);

  if (!result.success) notFound();

  const quest = result.data;

  return (
    <div className="space-y-6 max-w-xl">
      <div className="space-y-1">
        <Link
          href="/quests"
          className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors mb-4"
        >
          <ArrowLeft className="w-3 h-3" />
          Zurück zu Quests
        </Link>
        <h1 className="text-2xl font-semibold text-zinc-100">
          Quest bearbeiten
        </h1>
        <p className="text-sm text-zinc-500">
          Änderungen wirken sich nicht auf bereits vergabte Rewards aus.
        </p>
      </div>

      <QuestEditForm quest={quest} />
    </div>
  );
}