"use client";

import { useState } from "react";
import { completeQuest, deleteQuest } from "@/actions/quest.actions";
import { QuestTypeBadge, DifficultyBadge } from "./QuestBadge";
import { cn } from "@/lib/utils";
import type { QuestWithRewards } from "@/lib/types";
import { CheckCircle2, Trash2, Clock, Zap, Coins, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { toast } from "sonner";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface QuestCardProps {
  quest: QuestWithRewards;
  className?: string;
}

export function QuestCard({ quest, className }: QuestCardProps) {
  const [completing, setCompleting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [done, setDone] = useState(quest.status === "COMPLETED");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  async function handleComplete() {
    if (done || completing) return;
    setCompleting(true);

    const result = await completeQuest(quest.id);

    if (result.success) {
      setDone(true);

      if (result.data.leveledUp) {
        toast.success(`Level Up! Du bist jetzt Level ${result.data.newLevel}`, {
          description: `+${quest.xpReward} XP · +${quest.goldReward} Gold`,
          duration: 6000,
          icon: "⚔️",
        });
      } else {
        toast.success("Quest abgeschlossen!", {
          description: `+${quest.xpReward} XP · +${quest.goldReward} Gold`,
          duration: 4000,
        });
      }
    } else {
      toast.error("Fehler", { description: result.error });
    }

    setCompleting(false);
  }

  async function handleDeleteConfirm() {
    setShowDeleteDialog(false);
    setDeleting(true);

    const result = await deleteQuest(quest.id);

    if (!result.success) {
      toast.error("Fehler", { description: result.error });
      setDeleting(false);
    }
  }

  const isLoading = completing || deleting;

  return (
    <>
      <div
        className={cn(
          "group flex items-start gap-4 px-4 py-4 rounded-lg border transition-all duration-200",
          done
            ? "bg-zinc-900/40 border-zinc-800/50 opacity-60"
            : deleting
              ? "opacity-40 scale-95 border-zinc-800/50"
              : "bg-zinc-900 border-zinc-800 hover:border-zinc-700",
          className
        )}
      >
        {/* Complete Button */}
        <button
          onClick={handleComplete}
          disabled={done || isLoading}
          className={cn(
            "mt-0.5 shrink-0 transition-colors",
            done
              ? "text-emerald-500 cursor-default"
              : completing
                ? "text-emerald-500/50 cursor-wait"
                : "text-zinc-600 hover:text-emerald-500"
          )}
        >
          {completing ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <CheckCircle2 className="w-5 h-5" />
          )}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0 space-y-1.5">
          <div className="flex items-center gap-2 flex-wrap">
            <Link
              href={`/quests/${quest.id}`}
              className={cn(
                "text-sm font-medium text-zinc-100 hover:text-gold transition-colors",
                done && "line-through text-zinc-500 pointer-events-none"
              )}
            >
              {quest.title}
            </Link>
            <QuestTypeBadge type={quest.type} />
            <DifficultyBadge difficulty={quest.difficulty} />
          </div>

          {quest.description && (
            <p className="text-xs text-zinc-500 line-clamp-2">
              {quest.description}
            </p>
          )}

          <div className="flex items-center gap-4 text-xs text-zinc-600">
            <span className="flex items-center gap-1">
              <Zap className="w-3 h-3 text-gold" />
              {quest.xpReward} XP
            </span>
            <span className="flex items-center gap-1">
              <Coins className="w-3 h-3 text-yellow-500" />
              {quest.goldReward} Gold
            </span>

            {quest.deadline && !done && (
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {format(new Date(quest.deadline), "dd. MMM", { locale: de })}
              </span>
            )}

            {done && quest.completedAt && (
              <span className="text-emerald-600">
                Abgeschlossen{" "}
                {format(new Date(quest.completedAt), "dd. MMM", { locale: de })}
              </span>
            )}
          </div>
        </div>

        {/* Delete Button */}
        {!done && (
          <button
            onClick={() => setShowDeleteDialog(true)}
            disabled={isLoading}
            className={cn(
              "shrink-0 transition-all mt-0.5",
              deleting
                ? "text-red-500 cursor-wait"
                : "text-zinc-700 hover:text-red-500 opacity-0 group-hover:opacity-100"
            )}
          >
            {deleting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
          </button>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-zinc-100">
          <DialogHeader>
            <DialogTitle className="text-zinc-100">Quest löschen?</DialogTitle>
            <DialogDescription className="text-zinc-500">
              <span className="text-zinc-300 font-medium">&bdquo;{quest.title}&ldquo;</span>{" "}
              wird permanent gelöscht. Diese Aktion kann nicht rückgängig gemacht werden.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              className="border-zinc-700 text-zinc-400 hover:text-zinc-100"
            >
              Abbrechen
            </Button>
            <Button
              onClick={handleDeleteConfirm}
              className="bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20"
            >
              Löschen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}