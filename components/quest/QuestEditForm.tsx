"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateQuest } from "@/actions/quest.actions";
import { calculateRewards } from "@/lib/xp";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { QuestTypeBadge } from "./QuestBadge";
import { cn } from "@/lib/utils";
import type { QuestWithRewards, Difficulty } from "@/lib/types";
import { Zap, Coins } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

interface QuestEditFormProps {
  quest: QuestWithRewards;
}

const DIFFICULTIES: { label: string; value: Difficulty; color: string }[] = [
  { label: "Easy",   value: "EASY",   color: "text-emerald-400" },
  { label: "Medium", value: "MEDIUM", color: "text-yellow-400"  },
  { label: "Hard",   value: "HARD",   color: "text-orange-400"  },
  { label: "Epic",   value: "EPIC",   color: "text-purple-400"  },
];

export function QuestEditForm({ quest }: QuestEditFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState(quest.title);
  const [description, setDescription] = useState(quest.description ?? "");
  const [difficulty, setDifficulty] = useState<Difficulty>(quest.difficulty);
  const [deadline, setDeadline] = useState(
    quest.deadline
      ? format(new Date(quest.deadline), "yyyy-MM-dd")
      : ""
  );

  const isCompleted = quest.status === "COMPLETED";
  const preview = calculateRewards(difficulty, quest.type);
  const rewardsChanged = difficulty !== quest.difficulty;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || isCompleted) return;

    setLoading(true);
    setError(null);

    const result = await updateQuest(quest.id, {
      title: title.trim(),
      description: description.trim() || undefined,
      difficulty,
      deadline: deadline || undefined,
    });

    if (result.success) {
      toast.success("Quest aktualisiert.", {
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
      {/* Completed Warning */}
      {isCompleted && (
        <div className="px-4 py-3 rounded-lg bg-zinc-800/50 border border-zinc-700 text-xs text-zinc-400">
          Diese Quest wurde bereits abgeschlossen und kann nicht mehr bearbeitet werden.
        </div>
      )}

      {/* Quest Type – read only */}
      <div className="space-y-1.5">
        <Label className="text-zinc-300">Quest-Typ</Label>
        <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-zinc-900 border border-zinc-800">
          <QuestTypeBadge type={quest.type} />
          <span className="text-xs text-zinc-600">
            Typ kann nachträglich nicht geändert werden
          </span>
        </div>
      </div>

      {/* Title */}
      <div className="space-y-1.5">
        <Label htmlFor="title" className="text-zinc-300">
          Titel <span className="text-red-500">*</span>
        </Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={isCompleted}
          className="bg-zinc-900 border-zinc-700 text-zinc-100 placeholder:text-zinc-600 focus-visible:ring-gold disabled:opacity-50"
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
          disabled={isCompleted}
          className="bg-zinc-900 border-zinc-700 text-zinc-100 placeholder:text-zinc-600 focus-visible:ring-gold resize-none disabled:opacity-50"
          rows={3}
        />
      </div>

      {/* Difficulty */}
      <div className="space-y-2">
        <Label className="text-zinc-300">Schwierigkeit</Label>
        <div className="grid grid-cols-4 gap-2">
          {DIFFICULTIES.map((d) => (
            <button
              key={d.value}
              type="button"
              disabled={isCompleted}
              onClick={() => setDifficulty(d.value)}
              className={cn(
                "px-3 py-2 rounded-lg border text-xs font-medium transition-colors disabled:opacity-50",
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
          disabled={isCompleted}
          className="bg-zinc-900 border-zinc-700 text-zinc-100 focus-visible:ring-gold disabled:opacity-50"
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
        {rewardsChanged && (
          <span className="text-xs text-zinc-600 ml-auto">
            Rewards werden aktualisiert
          </span>
        )}
      </div>

      {/* Error */}
      {error && (
        <p className="text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      {/* Actions */}
      {!isCompleted && (
        <div className="flex gap-3">
          <Button
            type="submit"
            disabled={loading || !title.trim()}
            className="bg-gold text-zinc-950 hover:bg-amber-400 font-medium"
          >
            {loading ? "Wird gespeichert..." : "Änderungen speichern"}
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
      )}
    </form>
  );
}