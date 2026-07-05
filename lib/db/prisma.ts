import { PrismaPg } from "@prisma/adapter-pg";
import { Prisma, PrismaClient } from "@/generated/prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  prismaClientVersion?: number;
};

/** Bump when Prisma schema changes to invalidate dev hot-reload cache. */
const PRISMA_CLIENT_VERSION = 7;

const REQUIRED_PLANNED_ITEM_FIELDS = ["paidInstallmentCount"] as const;

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error("DATABASE_URL is not set");
  }

  const adapter = new PrismaPg({ connectionString });

  return new PrismaClient({ adapter });
}

function hasExpectedDelegates(client: PrismaClient): boolean {
  const plannedItemFields = new Set(
    Object.values(Prisma.PlannedItemScalarFieldEnum),
  );

  return (
    typeof client.transaction?.findMany === "function" &&
    typeof client.inboxMessage?.findMany === "function" &&
    typeof client.plannedItem?.findMany === "function" &&
    REQUIRED_PLANNED_ITEM_FIELDS.every((field) => plannedItemFields.has(field))
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

  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = client;
    globalForPrisma.prismaClientVersion = PRISMA_CLIENT_VERSION;
  }

  return client;
}

export const prisma = getPrismaClient();
