import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

import { resolveDatabasePoolMax } from "@/config/database";
import { Prisma, PrismaClient } from "@/generated/prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  prismaPool: Pool | undefined;
  prismaClientVersion?: number;
};

/** Bump when Prisma schema changes to invalidate dev hot-reload cache. */
const PRISMA_CLIENT_VERSION = 14;

const IS_DEV = process.env.NODE_ENV !== "production";
const POOL_MAX = resolveDatabasePoolMax(IS_DEV);

const REQUIRED_PLANNED_ITEM_FIELDS = ["paidInstallmentCount"] as const;
const REQUIRED_CATEGORY_BUDGET_FIELDS = ["repeatNextMonth"] as const;

function disconnectCachedClient(): void {
  const client = globalForPrisma.prisma;
  globalForPrisma.prisma = undefined;

  if (client) {
    void client.$disconnect();
  }
}

function recyclePrismaResources(): void {
  disconnectCachedClient();

  const pool = globalForPrisma.prismaPool;
  globalForPrisma.prismaPool = undefined;
  globalForPrisma.prismaClientVersion = undefined;

  void pool?.end();
}

/** Dev/ops — release local pool (e.g. before `db:release-connections`). */
export async function releasePrismaConnections(): Promise<void> {
  recyclePrismaResources();
}

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
    max: POOL_MAX,
    min: 0,
    idleTimeoutMillis: IS_DEV ? 2_000 : 20_000,
    connectionTimeoutMillis: 10_000,
    allowExitOnIdle: IS_DEV,
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

  // HMR may reload the Prisma client — reuse the existing pool so connections
  // are not leaked while the old pool is still closing.
  disconnectCachedClient();

  const client = createPrismaClient();

  globalForPrisma.prisma = client;
  globalForPrisma.prismaClientVersion = PRISMA_CLIENT_VERSION;

  return client;
}

if (IS_DEV) {
  const cleanup = () => {
    recyclePrismaResources();
  };

  process.once("SIGINT", cleanup);
  process.once("SIGTERM", cleanup);
}

export const prisma = getPrismaClient();
