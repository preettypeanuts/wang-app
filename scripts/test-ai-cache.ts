import "dotenv/config";

import { getCachedAiInsight } from "../lib/db/ai-insight-cache";
import { prisma } from "../lib/db/prisma";

async function main() {
  const user = await prisma.user.findFirst({
    where: { email: "demo@wang.com" },
    select: { id: true },
  });

  if (!user) {
    throw new Error("Demo user not found. Run npm run db:seed-demo first.");
  }

  const result = await getCachedAiInsight(
    user.id,
    "journal_condition",
    "2026-07-10",
  );

  if (result !== null) {
    throw new Error("Expected null cache result in empty database.");
  }

  console.log("AI insight cache read is resilient when table is missing.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
