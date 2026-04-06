"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createQuest } from "@/actions/quest.actions";
import { calculateRewards } from "@/lib/xp";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type { QuestType, Difficulty } from "@/lib/types";
import { Zap, Coins } from "lucide-react";
import { toast } from "sonner";

const QUEST_TYPES: { label: string; value: QuestType; description: string }[] =
  [
    {
      label: "Main Quest",
      value: "MAIN",
      description: "Wichtiges Hauptziel",
    },
    {
      label: "Side Quest",
      value: "SIDE",
      description: "Nebenziel oder Projekt",
    },
    {
      label: "Daily Quest",
      value: "DAILY",
      description: "Tägliche Wiederholung",
    },
  ];

const DIFFICULTIES: { label: string; value: Difficulty; color: string }[] = [
  { label: "Easy", value: "EASY", color: "text-emerald-400" },
  { label: "Medium", value: "MEDIUM", color: "text-yellow-400" },
  { label: "Hard", value: "HARD", color: "text-orange-400" },
  { label: "Epic", value: "EPIC", color: "text-purple-400" },
];

export function QuestForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<QuestType>("SIDE");
  const [difficulty, setDifficulty] = useState<Difficulty>("MEDIUM");
  const [deadline, setDeadline] = useState("");

  // Live-Preview der Rewards
  const preview = calculateRewards(difficulty, type);

  async function handleSubmit(e: React.FormEvent) {
  e.preventDefault();
  if (!title.trim()) return;

  setLoading(true);
  setError(null);

  const result = await createQuest({
    title: title.trim(),
    description: description.trim() || undefined,
    type,
    difficulty,
    deadline: deadline || undefined,
  });

  if (result.success) {
    toast.success("Quest erstellt!", {
      description: `${title.trim()} wurde deinem Questboard hinzugefügt.`,
      duration: 3000,
    });
    router.push("/quests");
  } else {
    setError(result.error);
    setLoading(false);
  }
}

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Title */}
      <div className="space-y-1.5">
        <Label htmlFor="title" className="text-zinc-300">
          Titel <span className="text-red-500">*</span>
        </Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="z.B. Portfolio-Website fertigstellen"
          className="bg-zinc-900 border-zinc-700 text-zinc-100 placeholder:text-zinc-600 focus-visible:ring-gold"
          required
        />
      </div>

      {/* Description */}
      <div className="space-y-1.5">
        <Label htmlFor="description" className="text-zinc-300">
          Beschreibung{" "}
          <span className="text-zinc-600 font-normal">(optional)</span>
        </Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Was genau soll erreicht werden?"
          className="bg-zinc-900 border-zinc-700 text-zinc-100 placeholder:text-zinc-600 focus-visible:ring-gold resize-none"
          rows={3}
        />
      </div>

      {/* Type */}
      <div className="space-y-2">
        <Label className="text-zinc-300">Quest-Typ</Label>
        <div className="grid grid-cols-3 gap-2">
          {QUEST_TYPES.map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() => setType(t.value)}
              className={cn(
                "flex flex-col items-start px-3 py-2.5 rounded-lg border text-left transition-colors",
                type === t.value
                  ? "border-zinc-500 bg-zinc-800 text-zinc-100"
                  : "border-zinc-800 bg-zinc-900 text-zinc-400 hover:border-zinc-700"
              )}
            >
              <span className="text-xs font-medium">{t.label}</span>
              <span className="text-xs text-zinc-600 mt-0.5">
                {t.description}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Difficulty */}
      <div className="space-y-2">
        <Label className="text-zinc-300">Schwierigkeit</Label>
        <div className="grid grid-cols-4 gap-2">
          {DIFFICULTIES.map((d) => (
            <button
              key={d.value}
              type="button"
              onClick={() => setDifficulty(d.value)}
              className={cn(
                "px-3 py-2 rounded-lg border text-xs font-medium transition-colors",
                difficulty === d.value
                  ? "border-zinc-500 bg-zinc-800"
                  : "border-zinc-800 bg-zinc-900 text-zinc-500 hover:border-zinc-700"
              )}
            >
              <span className={difficulty === d.value ? d.color : ""}>
                {d.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Deadline */}
      <div className="space-y-1.5">
        <Label htmlFor="deadline" className="text-zinc-300">
          Deadline{" "}
          <span className="text-zinc-600 font-normal">(optional)</span>
        </Label>
        <Input
          id="deadline"
          type="date"
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
          className="bg-zinc-900 border-zinc-700 text-zinc-100 focus-visible:ring-gold"
        />
      </div>

      {/* Reward Preview */}
      <div className="flex items-center gap-4 px-4 py-3 rounded-lg bg-zinc-900 border border-zinc-800">
        <span className="text-xs text-zinc-500">Belohnung:</span>
        <span className="flex items-center gap-1 text-xs font-medium text-gold">
          <Zap className="w-3 h-3" />
          {preview.xpReward} XP
        </span>
        <span className="flex items-center gap-1 text-xs font-medium text-yellow-500">
          <Coins className="w-3 h-3" />
          {preview.goldReward} Gold
        </span>
      </div>

      {/* Error */}
      {error && (
        <p className="text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      {/* Submit */}
      <div className="flex gap-3">
        <Button
          type="submit"
          disabled={loading || !title.trim()}
          className="bg-gold text-zinc-950 hover:bg-amber-400 font-medium"
        >
          {loading ? "Wird erstellt..." : "Quest erstellen"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          className="border-zinc-700 text-zinc-400 hover:text-zinc-100"
        >
          Abbrechen
        </Button>
      </div>
    </form>
  );
}