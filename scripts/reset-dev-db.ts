/**
 * Wipe all app + auth data, then seed the demo account.
 *
 * Run: npm run db:reset
 *
 * Requires ALLOW_DB_RESET=true (set by npm script).
 */
import "dotenv/config";
import { execSync } from "node:child_process";
import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "../generated/prisma/client";

const SCHEMA = process.env.DB_SCHEMA ?? "monmon_whethertie";

const TABLES = [
  "AppNotification",
  "PushSubscription",
  "InboxMessage",
  "Transaction",
  "CategoryBudget",
  "PlannedItem",
  "Plan",
  "SavingsGoal",
  "session",
  "account",
  "user",
  "verification",
] as const;

async function main() {
  if (process.env.ALLOW_DB_RESET !== "true") {
    console.error(
      "Refusing to reset. Run via: npm run db:reset (sets ALLOW_DB_RESET=true).",
    );
    process.exit(1);
  }

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set");
  }

  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString }),
  });

  const quoted = TABLES.map((table) => `"${SCHEMA}"."${table}"`).join(", ");

  console.log(`Truncating ${TABLES.length} tables in schema "${SCHEMA}"...`);
  await prisma.$executeRawUnsafe(`TRUNCATE TABLE ${quoted} RESTART IDENTITY CASCADE`);
  await prisma.$disconnect();

  console.log("Database cleared. Seeding demo account...\n");
  execSync("npx tsx scripts/seed-demo-user.ts", {
    stdio: "inherit",
    env: process.env,
  });
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
