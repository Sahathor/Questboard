"use server";

import { prisma } from "@/lib/prisma";
import { applyXP } from "@/lib/xp";
import type { ActionResult, CharacterWithSkills } from "@/lib/types";
import { SkillType } from "@prisma/client";

// ─── Hilfsfunktion: sicherstellen dass ein Character existiert ───

async function ensureCharacter(): Promise<CharacterWithSkills> {
  const existing = await prisma.character.findFirst({
    include: { skills: true },
  });

  if (existing) return existing;

  // Beim ersten Start: Character + alle Skills anlegen
  const character = await prisma.character.create({
    data: {
      name: "Hero",
      skills: {
        create: Object.values(SkillType).map((type) => ({
          type,
          level: 1,
          xp: 0,
          xpToNext: 50,
        })),
      },
    },
    include: { skills: true },
  });

  return character;
}

// ─── Character laden ──────────────────────────────────────

export async function getCharacter(): Promise<
  ActionResult<CharacterWithSkills>
> {
  try {
    const character = await ensureCharacter();
    return { success: true, data: character };
  } catch {
    return { success: false, error: "Character konnte nicht geladen werden." };
  }
}

// ─── XP & Gold hinzufügen ─────────────────────────────────

export async function addRewards(
  characterId: string,
  gainedXP: number,
  gainedGold: number,
  skillRewards: { skill: SkillType; xp: number }[]
): Promise<ActionResult<CharacterWithSkills>> {
  try {
    const character = await prisma.character.findUniqueOrThrow({
      where: { id: characterId },
      include: { skills: true },
    });

    const { newXP, newLevel, newXpToNext } = applyXP(
      character.xp,
      character.level,
      gainedXP
    );

    // Character updaten
    const updated = await prisma.character.update({
      where: { id: characterId },
      data: {
        xp: newXP,
        level: newLevel,
        xpToNext: newXpToNext,
        gold: character.gold + gainedGold,
        lastActive: new Date(),
      },
      include: { skills: true },
    });

    // Skill XP updaten
    for (const reward of skillRewards) {
      const skill = character.skills.find((s: { type: SkillType }) => s.type === reward.skill);
      if (!skill) continue;

      let skillXP = skill.xp + reward.xp;
      let skillLevel = skill.level;
      let skillXpToNext = skill.xpToNext;

      // Skill Level Up
      while (skillXP >= skillXpToNext) {
        skillXP -= skillXpToNext;
        skillLevel += 1;
        skillXpToNext = Math.round(50 * Math.pow(skillLevel, 1.2));
      }

      await prisma.skills.update({
        where: { id: skill.id },
        data: {
          xp: skillXP,
          level: skillLevel,
          xpToNext: skillXpToNext,
        },
      });
    }

    return { success: true, data: updated };
  } catch {
    return { success: false, error: "Rewards konnten nicht vergeben werden." };
  }
}

// ─── Streak aktualisieren ─────────────────────────────────

export async function updateStreak(
  characterId: string
): Promise<ActionResult<{ streak: number }>> {
  try {
    const character = await prisma.character.findUniqueOrThrow({
      where: { id: characterId },
    });

    const now = new Date();
    const last = new Date(character.lastActive);
    const diffDays = Math.floor(
      (now.getTime() - last.getTime()) / (1000 * 60 * 60 * 24)
    );

    // Streak bleibt: heute schon aktiv (0 Tage diff)
    // Streak +1: gestern aktiv (1 Tag diff)
    // Streak reset: länger nicht aktiv (>1 Tag diff)
    const newStreak =
      diffDays === 0
        ? character.streak
        : diffDays === 1
          ? character.streak + 1
          : 0;

    await prisma.character.update({
      where: { id: characterId },
      data: { streak: newStreak, lastActive: now },
    });

    return { success: true, data: { streak: newStreak } };
  } catch {
    return { success: false, error: "Streak konnte nicht aktualisiert werden." };
  }
}