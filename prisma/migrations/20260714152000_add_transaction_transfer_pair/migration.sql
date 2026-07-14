-- AlterTable
ALTER TABLE "monmon_whethertie"."Transaction" ADD COLUMN "transferPairId" TEXT;

-- CreateIndex
CREATE INDEX "Transaction_transferPairId_idx" ON "monmon_whethertie"."Transaction"("transferPairId");
