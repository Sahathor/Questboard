"use server";

import { prisma } from "@/lib/prisma";
import { calculateRewards, getSkillRewards } from "@/lib/xp";
import { addRewards, updateStreak } from "@/actions/character.actions";
import type { ActionResult, CreateQuestInput, QuestWithRewards } from "@/lib/types";
import type { Difficulty } from "@prisma/client";
import { revalidatePath } from "next/cache";

// ─── Quest erstellen ──────────────────────────────────────

export async function createQuest(
  input: CreateQuestInput
): Promise<ActionResult<QuestWithRewards>> {
  try {
    const character = await prisma.character.findFirst();

    if (!character) {
      return { success: false, error: "Kein Character gefunden." };
    }

    const { xpReward, goldReward } = calculateRewards(
      input.difficulty,
      input.type
    );

    const skillRewards = getSkillRewards(input.type, input.difficulty);

    const quest = await prisma.quest.create({
      data: {
        title: input.title,
        description: input.description ?? null,
        type: input.type,
        difficulty: input.difficulty,
        deadline: input.deadline ? new Date(input.deadline) : null,
        xpReward,
        goldReward,
        characterId: character.id,
        skillRewards: {
          create: skillRewards,
        },
      },
      include: { skillRewards: true },
    });

    revalidatePath("/");
    revalidatePath("/quests");

    return { success: true, data: quest };
  } catch (e) {
  console.error("[createQuest]", e);
  return { success: false, error: "Quest konnte nicht erstellt werden." };
}
}

// ─── Quest abschließen ────────────────────────────────────

// Rückgabetyp anpassen
export async function completeQuest(
  questId: string
): Promise<ActionResult<{ quest: QuestWithRewards; leveledUp: boolean; newLevel: number }>> {
  try {
    const quest = await prisma.quest.findUniqueOrThrow({
      where: { id: questId },
      include: { skillRewards: true },
    });

    if (quest.status !== "ACTIVE") {
      return { success: false, error: "Quest ist nicht mehr aktiv." };
    }

    const updated = await prisma.quest.update({
      where: { id: questId },
      data: {
        status: "COMPLETED",
        completedAt: new Date(),
      },
      include: { skillRewards: true },
    });

    // Character vor den Rewards laden
    const characterBefore = await prisma.character.findUniqueOrThrow({
      where: { id: quest.characterId },
    });

    await addRewards(
      quest.characterId,
      quest.xpReward,
      quest.goldReward,
      quest.skillRewards
    );

    await updateStreak(quest.characterId);

    // Character nach den Rewards laden
    const characterAfter = await prisma.character.findUniqueOrThrow({
      where: { id: quest.characterId },
    });

    const leveledUp = characterAfter.level > characterBefore.level;

    revalidatePath("/");
    revalidatePath("/quests");
    revalidatePath("/character");

    return {
      success: true,
      data: {
        quest: updated,
        leveledUp,
        newLevel: characterAfter.level,
      },
    };
  } catch (e) {
    console.error("[completeQuest]", e);
    return { success: false, error: "Quest konnte nicht abgeschlossen werden." };
  }
}

// ─── Quest löschen ────────────────────────────────────────

export async function deleteQuest(
  questId: string
): Promise<ActionResult> {
  try {
    await prisma.quest.delete({
      where: { id: questId },
    });

    revalidatePath("/");
    revalidatePath("/quests");

    return { success: true, data: undefined };
  } catch {
    return { success: false, error: "Quest konnte nicht gelöscht werden." };
  }
}

// ─── Quests laden ─────────────────────────────────────────

export async function getQuests(): Promise<ActionResult<QuestWithRewards[]>> {
  try {
    const character = await prisma.character.findFirst();

    if (!character) {
      return { success: true, data: [] };
    }

    const quests = await prisma.quest.findMany({
      where: { characterId: character.id },
      include: { skillRewards: true },
      orderBy: { createdAt: "desc" },
    });

    return { success: true, data: quests };
  } catch {
    return { success: false, error: "Quests konnten nicht geladen werden." };
  }
}

// ─── Heute abgeschlossene Quests ──────────────────────────

export async function getCompletedToday(): Promise<ActionResult<number>> {
  try {
    const start = new Date();
    start.setHours(0, 0, 0, 0);

    const count = await prisma.quest.count({
      where: {
        status: "COMPLETED",
        completedAt: { gte: start },
      },
    });

    return { success: true, data: count };
  } catch {
    return { success: false, error: "Statistik konnte nicht geladen werden." };
  }
}

// ─── Quest per ID laden ───────────────────────────────────

export async function getQuestById(
  questId: string
): Promise<ActionResult<QuestWithRewards>> {
  try {
    const quest = await prisma.quest.findUniqueOrThrow({
      where: { id: questId },
      include: { skillRewards: true },
    });
    return { success: true, data: quest };
  } catch {
    return { success: false, error: "Quest nicht gefunden." };
  }
}

// ─── Quest aktualisieren ──────────────────────────────────

export type UpdateQuestInput = {
  title: string;
  description?: string;
  difficulty: Difficulty;
  deadline?: string;
};

export async function updateQuest(
  questId: string,
  input: UpdateQuestInput
): Promise<ActionResult<QuestWithRewards>> {
  try {
    const existing = await prisma.quest.findUniqueOrThrow({
      where: { id: questId },
    });

    if (existing.status !== "ACTIVE") {
      return {
        success: false,
        error: "Abgeschlossene Quests können nicht bearbeitet werden.",
      };
    }

    // Rewards neu berechnen wenn Difficulty geändert wurde
    const difficultyChanged = existing.difficulty !== input.difficulty;
    const rewards = difficultyChanged
      ? calculateRewards(input.difficulty, existing.type)
      : { xpReward: existing.xpReward, goldReward: existing.goldReward };

    // Skill Rewards aktualisieren wenn Difficulty geändert
    if (difficultyChanged) {
      await prisma.questSkillReward.deleteMany({
        where: { questId },
      });

      const newSkillRewards = getSkillRewards(existing.type, input.difficulty);
      await prisma.questSkillReward.createMany({
        data: newSkillRewards.map((r) => ({ ...r, questId })),
      });
    }

    const updated = await prisma.quest.update({
      where: { id: questId },
      data: {
        title: input.title,
        description: input.description ?? null,
        difficulty: input.difficulty,
        deadline: input.deadline ? new Date(input.deadline) : null,
        xpReward: rewards.xpReward,
        goldReward: rewards.goldReward,
      },
      include: { skillRewards: true },
    });

    revalidatePath("/");
    revalidatePath("/quests");
    revalidatePath(`/quests/${questId}`);

    return { success: true, data: updated };
  } catch (e) {
    console.error("[updateQuest]", e);
    return { success: false, error: "Quest konnte nicht aktualisiert werden." };
  }
}
