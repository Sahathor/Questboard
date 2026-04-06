import type { Character, Quest, Skills, QuestSkillReward, QuestType, Difficulty, QuestStatus, SkillType } from "@prisma/client";

// ─── Re-exports für convenience ──────────────────────────

export type { QuestType, Difficulty, QuestStatus, SkillType };

// ─── Prisma Model Types ───────────────────────────────────

export type { Character, Quest, Skills, QuestSkillReward };

// ─── Extended Types (mit Relations) ──────────────────────

export type QuestWithRewards = Quest & {
  skillRewards: QuestSkillReward[];
};

export type CharacterWithSkills = Character & {
  skills: Skills[];
};

export type CharacterWithAll = Character & {
  skills: Skills[];
  quests: QuestWithRewards[];
};

// ─── Form / Input Types ───────────────────────────────────

export type CreateQuestInput = {
  title: string;
  description?: string;
  type: QuestType;
  difficulty: Difficulty;
  deadline?: string; // ISO-String aus dem Form, wird in Date konvertiert
};

// ─── Server Action Response ───────────────────────────────

export type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };

// ─── Dashboard Stats ──────────────────────────────────────

export type DashboardStats = {
  activeQuests: number;
  completedToday: number;
  currentStreak: number;
  xpToNextLevel: number;
  xpProgress: number; // Prozent 0–100
};