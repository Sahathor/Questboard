import { QuestForm } from "@/components/quest/QuestForm";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function NewQuestPage() {
  return (
    <div className="space-y-6 max-w-xl">
      {/* Header */}
      <div className="space-y-1">
        <Link
          href="/quests"
          className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors mb-4"
        >
          <ArrowLeft className="w-3 h-3" />
          Zurück zu Quests
        </Link>
        <h1 className="text-2xl font-semibold text-zinc-100">
          Neue Quest erstellen
        </h1>
        <p className="text-sm text-zinc-500">
          Definiere deine Quest. XP und Gold werden automatisch berechnet.
        </p>
      </div>

      {/* Form */}
      <QuestForm />
    </div>
  );
}