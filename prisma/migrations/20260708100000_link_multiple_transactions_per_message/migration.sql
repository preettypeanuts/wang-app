-- Link transactions to inbox messages (many-to-one).
ALTER TABLE "monmon_whethertie"."Transaction"
ADD COLUMN "inboxMessageId" TEXT;

UPDATE "monmon_whethertie"."Transaction" AS t
SET "inboxMessageId" = m.id
FROM "monmon_whethertie"."InboxMessage" AS m
WHERE m."transactionId" = t.id;

ALTER TABLE "monmon_whethertie"."InboxMessage"
DROP CONSTRAINT IF EXISTS "InboxMessage_transactionId_fkey";

DROP INDEX IF EXISTS "monmon_whethertie"."InboxMessage_transactionId_key";

ALTER TABLE "monmon_whethertie"."InboxMessage"
DROP COLUMN "transactionId";

CREATE INDEX "Transaction_inboxMessageId_idx"
ON "monmon_whethertie"."Transaction"("inboxMessageId");

ALTER TABLE "monmon_whethertie"."Transaction"
ADD CONSTRAINT "Transaction_inboxMessageId_fkey"
FOREIGN KEY ("inboxMessageId")
REFERENCES "monmon_whethertie"."InboxMessage"("id")
ON DELETE SET NULL
ON UPDATE CASCADE;
