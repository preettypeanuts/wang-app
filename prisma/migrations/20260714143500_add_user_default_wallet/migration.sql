-- AlterTable
ALTER TABLE "monmon_whethertie"."user" ADD COLUMN "defaultWalletId" TEXT;

-- AddForeignKey
ALTER TABLE "monmon_whethertie"."user" ADD CONSTRAINT "user_defaultWalletId_fkey" FOREIGN KEY ("defaultWalletId") REFERENCES "monmon_whethertie"."Wallet"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Backfill: point existing users at their default (or oldest) active wallet
UPDATE "monmon_whethertie"."user" u
SET "defaultWalletId" = w.id
FROM (
  SELECT DISTINCT ON ("userId") id, "userId"
  FROM "monmon_whethertie"."Wallet"
  WHERE "isArchived" = false
  ORDER BY "userId", "isDefault" DESC, "createdAt" ASC
) w
WHERE w."userId" = u.id AND u."defaultWalletId" IS NULL;
