-- CreateTable
CREATE TABLE "monmon_whethertie"."UserCategoryOverride" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "keyword" TEXT NOT NULL,
    "type" "monmon_whethertie"."TransactionType" NOT NULL,
    "category" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserCategoryOverride_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "UserCategoryOverride_userId_idx" ON "monmon_whethertie"."UserCategoryOverride"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "UserCategoryOverride_userId_keyword_type_key" ON "monmon_whethertie"."UserCategoryOverride"("userId", "keyword", "type");

-- AddForeignKey
ALTER TABLE "monmon_whethertie"."UserCategoryOverride" ADD CONSTRAINT "UserCategoryOverride_userId_fkey" FOREIGN KEY ("userId") REFERENCES "monmon_whethertie"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
