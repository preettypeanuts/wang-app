/**
 * Sync database schema for deploy / production fixes.
 *
 * Usage:
 *   DATABASE_URL="postgresql://..." npm run db:sync
 *
 * Steps:
 * 1. Ensure schema exists (db:init)
 * 2. Apply pending migrations when history exists
 * 3. Push any remaining Prisma schema drift (db:push)
 */
import "dotenv/config";
import { spawnSync } from "node:child_process";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error("DATABASE_URL is not set.");
  process.exit(1);
}

function run(command: string, args: string[]): boolean {
  const result = spawnSync(command, args, {
    stdio: "inherit",
    env: process.env,
  });

  return result.status === 0;
}

console.log("→ Ensuring PostgreSQL schema exists...");
if (!run("node", ["scripts/init-db.mjs"])) {
  process.exit(1);
}

console.log("→ Applying migrations (if any)...");
const migrateOk = run("npx", ["prisma", "migrate", "deploy"]);

if (!migrateOk) {
  console.warn(
    "⚠ migrate deploy skipped or failed (common on db:push-only databases). Continuing with db push...",
  );
}

console.log("→ Pushing Prisma schema...");
if (!run("npx", ["prisma", "db", "push"])) {
  process.exit(1);
}

console.log("✓ Database schema is in sync.");
