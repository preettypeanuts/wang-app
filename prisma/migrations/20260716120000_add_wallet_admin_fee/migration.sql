-- AlterTable
ALTER TABLE "monmon_whethertie"."Wallet"
ADD COLUMN "adminFeeAmount" INTEGER,
ADD COLUMN "adminFeeDay" INTEGER;

-- AlterTable
ALTER TABLE "monmon_whethertie"."PlannedItem"
ADD COLUMN "walletId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "PlannedItem_walletId_key" ON "monmon_whethertie"."PlannedItem"("walletId");

-- AddForeignKey
ALTER TABLE "monmon_whethertie"."PlannedItem"
ADD CONSTRAINT "PlannedItem_walletId_fkey"
FOREIGN KEY ("walletId") REFERENCES "monmon_whethertie"."Wallet"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
