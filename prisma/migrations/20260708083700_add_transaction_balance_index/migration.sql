-- CreateIndex
CREATE INDEX "Transaction_userId_type_occurredAt_idx" ON "monmon_whethertie"."Transaction"("userId", "type", "occurredAt");
