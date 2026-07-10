-- Overview page depends on AI insight cache and budget/planner columns added after
-- the initial incremental migrations. Safe to re-run on partially migrated databases.

DO $$ BEGIN
  CREATE TYPE "monmon_whethertie"."AiInsightCacheType" AS ENUM (
    'journal_condition',
    'plans_insight'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS "monmon_whethertie"."ai_insight_cache" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "type" "monmon_whethertie"."AiInsightCacheType" NOT NULL,
  "dateKey" TEXT NOT NULL,
  "payload" JSONB NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ai_insight_cache_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "ai_insight_cache_userId_type_dateKey_key"
  ON "monmon_whethertie"."ai_insight_cache"("userId", "type", "dateKey");

CREATE INDEX IF NOT EXISTS "ai_insight_cache_userId_idx"
  ON "monmon_whethertie"."ai_insight_cache"("userId");

DO $$ BEGIN
  ALTER TABLE "monmon_whethertie"."ai_insight_cache"
    ADD CONSTRAINT "ai_insight_cache_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "monmon_whethertie"."user"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE "monmon_whethertie"."CategoryBudget"
  ADD COLUMN IF NOT EXISTS "repeatNextMonth" BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE "monmon_whethertie"."PlannedItem"
  ADD COLUMN IF NOT EXISTS "paidInstallmentCount" INTEGER NOT NULL DEFAULT 0;

ALTER TABLE "monmon_whethertie"."PlannedItem"
  ADD COLUMN IF NOT EXISTS "repeatNextMonth" BOOLEAN NOT NULL DEFAULT false;
