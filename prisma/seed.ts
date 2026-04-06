import { PrismaClient, QuestType, Difficulty, SkillType } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { calculateRewards, getSkillRewards } from "../lib/xp";

const prisma = new PrismaClient({ adapter: new PrismaPg(process.env.DATABASE_URL!) });

async function main() {
  console.log("🌱 Seeding database...");

  // Bestehende Daten löschen
  await prisma.questSkillReward.deleteMany();
  await prisma.quest.deleteMany();
  await prisma.skills.deleteMany();
  await prisma.character.deleteMany();

  // Character anlegen
  const character = await prisma.character.create({
    data: {
      name: "Hero",
      level: 1,
      xp: 40,
      xpToNext: 100,
      gold: 15,
      streak: 3,
      skills: {
        create: Object.values(SkillType).map((type) => ({
          type,
          level: 1,
          xp: type === SkillType.DISCIPLINE ? 30 : type === SkillType.FOCUS ? 15 : 0,
          xpToNext: 50,
        })),
      },
    },
  });

  console.log(`✓ Character erstellt: ${character.name}`);

  // Beispiel-Quests
  const quests: {
    title: string;
    description: string;
    type: QuestType;
    difficulty: Difficulty;
    deadline?: Date;
  }[] = [
    {
      title: "Portfolio-Website fertigstellen",
      description: "Alle Projekte eintragen, About-Seite schreiben und auf Vercel deployen.",
      type: QuestType.MAIN,
      difficulty: Difficulty.HARD,
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // in 7 Tagen
    },
    {
      title: "Leetcode – 3 Easy Problems",
      description: "Arrays und Strings. Fokus auf saubere Lösung, nicht nur auf Passing.",
      type: QuestType.SIDE,
      difficulty: Difficulty.MEDIUM,
    },
    {
      title: "30 Minuten Dokumentation lesen",
      description: "Next.js App Router Docs – Server Actions Kapitel.",
      type: QuestType.DAILY,
      difficulty: Difficulty.EASY,
    },
  ];

  for (const q of quests) {
    const { xpReward, goldReward } = calculateRewards(q.difficulty, q.type);
    const skillRewards = getSkillRewards(q.type, q.difficulty);

    await prisma.quest.create({
      data: {
        title: q.title,
        description: q.description,
        type: q.type,
        difficulty: q.difficulty,
        deadline: q.deadline ?? null,
        xpReward,
        goldReward,
        characterId: character.id,
        skillRewards: {
          create: skillRewards,
        },
      },
    });

    console.log(`✓ Quest erstellt: ${q.title}`);
  }

  console.log("✅ Seed abgeschlossen.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });