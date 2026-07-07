import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

import { Prisma, PrismaClient } from "@/generated/prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  prismaPool: Pool | undefined;
  prismaClientVersion?: number;
};

/** Bump when Prisma schema changes to invalidate dev hot-reload cache. */
const PRISMA_CLIENT_VERSION = 14;

/** One connection per serverless instance — safe for low DB connection limits. */
const SERVERLESS_POOL_MAX = 1;

const REQUIRED_PLANNED_ITEM_FIELDS = ["paidInstallmentCount"] as const;
const REQUIRED_CATEGORY_BUDGET_FIELDS = ["repeatNextMonth"] as const;

function getConnectionPool(): Pool {
  const cached = globalForPrisma.prismaPool;

  if (cached) {
    return cached;
  }

  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error("DATABASE_URL is not set");
  }

  const pool = new Pool({
    connectionString,
    max: SERVERLESS_POOL_MAX,
    idleTimeoutMillis: 20_000,
    connectionTimeoutMillis: 10_000,
  });

  globalForPrisma.prismaPool = pool;

  return pool;
}

function createPrismaClient() {
  const adapter = new PrismaPg(getConnectionPool());

  return new PrismaClient({ adapter });
}

function hasExpectedDelegates(client: PrismaClient): boolean {
  const plannedItemFields = new Set(
    Object.values(Prisma.PlannedItemScalarFieldEnum),
  );
  const categoryBudgetFields = new Set(
    Object.values(Prisma.CategoryBudgetScalarFieldEnum),
  );

  return (
    typeof client.transaction?.findMany === "function" &&
    typeof client.inboxMessage?.findMany === "function" &&
    typeof client.plannedItem?.findMany === "function" &&
    typeof client.plan?.findMany === "function" &&
    typeof client.savingsGoal?.findMany === "function" &&
    typeof client.categoryBudget?.findMany === "function" &&
    typeof client.user?.findMany === "function" &&
    REQUIRED_PLANNED_ITEM_FIELDS.every((field) => plannedItemFields.has(field)) &&
    REQUIRED_CATEGORY_BUDGET_FIELDS.every((field) =>
      categoryBudgetFields.has(field),
    )
  );
}

function getPrismaClient(): PrismaClient {
  const cached = globalForPrisma.prisma;

  if (
    cached &&
    hasExpectedDelegates(cached) &&
    globalForPrisma.prismaClientVersion === PRISMA_CLIENT_VERSION
  ) {
    return cached;
  }

  const client = createPrismaClient();

  globalForPrisma.prisma = client;
  globalForPrisma.prismaClientVersion = PRISMA_CLIENT_VERSION;

  return client;
}

export const prisma = getPrismaClient();
