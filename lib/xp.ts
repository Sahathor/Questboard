import { Difficulty, QuestType, SkillType } from "@prisma/client";

// ─── XP & Gold Rewards by Difficulty ─────────────────────

const DIFFICULTY_REWARDS: Record<
  Difficulty,
  { xp: number; gold: number }
> = {
  EASY:   { xp: 25,  gold: 10  },
  MEDIUM: { xp: 50,  gold: 25  },
  HARD:   { xp: 100, gold: 50  },
  EPIC:   { xp: 200, gold: 100 },
};

// Quest-Typ-Multiplikator
const TYPE_MULTIPLIER: Record<QuestType, number> = {
  DAILY: 0.8,
  SIDE:  1.0,
  MAIN:  1.5,
};

export function calculateRewards(
  difficulty: Difficulty,
  type: QuestType
): { xpReward: number; goldReward: number } {
  const base = DIFFICULTY_REWARDS[difficulty];
  const multiplier = TYPE_MULTIPLIER[type];

  return {
    xpReward:   Math.round(base.xp   * multiplier),
    goldReward: Math.round(base.gold * multiplier),
  };
}

// ─── Level Calculation ────────────────────────────────────

// XP für nächstes Level: steigt mit jedem Level leicht an
export function xpForNextLevel(level: number): number {
  return Math.round(100 * Math.pow(level, 1.3));
}

// Nach XP-Gewinn: berechne neues Level und überschüssige XP
export function applyXP(
  currentXP: number,
  currentLevel: number,
  gainedXP: number
): { newXP: number; newLevel: number; newXpToNext: number } {
  let xp = currentXP + gainedXP;
  let level = currentLevel;

  while (xp >= xpForNextLevel(level)) {
    xp -= xpForNextLevel(level);
    level += 1;
  }

  return {
    newXP:       xp,
    newLevel:    level,
    newXpToNext: xpForNextLevel(level),
  };
}

// ─── Skill XP Rewards by Quest Type ──────────────────────

// Welche Skills werden durch welchen Quest-Typ trainiert
export function getSkillRewards(
  type: QuestType,
  difficulty: Difficulty
): { skill: SkillType; xp: number }[] {
  const base = DIFFICULTY_REWARDS[difficulty].xp;
  const skillXP = Math.round(base * 0.4);

  const skillMap: Record<QuestType, SkillType[]> = {
    MAIN:  [SkillType.DISCIPLINE, SkillType.ENDURANCE],
    SIDE:  [SkillType.CREATIVITY, SkillType.FOCUS],
    DAILY: [SkillType.DISCIPLINE, SkillType.FOCUS],
  };

  return skillMap[type].map((skill) => ({ skill, xp: skillXP }));
}