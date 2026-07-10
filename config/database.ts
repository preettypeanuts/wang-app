/**
 * Postgres connection budgeting for the remote DB role (30 concurrent max).
 *
 * Total budget:
 *   30 role limit
 * -  8 reserved (Prisma Studio, migrate, scripts, cron, spike buffer)
 * = 22 for app traffic across all Node processes.
 */

/** Hard limit on the Postgres role — keep in sync with hosting provider. */
export const DATABASE_ROLE_MAX_CONNECTIONS = 30;

/** Headroom for ops tooling and unexpected spikes — not for app pools. */
export const DATABASE_CONNECTION_RESERVE = 8;

/** Connections available to app pools (all processes combined). */
export const DATABASE_APP_CONNECTION_BUDGET =
  DATABASE_ROLE_MAX_CONNECTIONS - DATABASE_CONNECTION_RESERVE;

/**
 * Expected concurrent server processes in production (e.g. Vercel lambdas).
 * pool_max × instances should stay ≤ DATABASE_APP_CONNECTION_BUDGET.
 */
const PRODUCTION_MAX_SERVER_INSTANCES = 5;

/** Dev — single process; keep low to avoid exhausting the DB role during HMR. */
export const DATABASE_POOL_MAX_DEVELOPMENT = 4;

/** Prod — conservative per instance for serverless multiplication. */
export const DATABASE_POOL_MAX_PRODUCTION = Math.min(
  5,
  Math.floor(
    DATABASE_APP_CONNECTION_BUDGET / PRODUCTION_MAX_SERVER_INSTANCES,
  ),
);

export function resolveDatabasePoolMax(isDev: boolean): number {
  const override = process.env.DATABASE_POOL_MAX?.trim();

  if (override) {
    const parsed = Number.parseInt(override, 10);

    if (Number.isFinite(parsed) && parsed > 0) {
      return Math.min(parsed, DATABASE_APP_CONNECTION_BUDGET);
    }
  }

  return isDev ? DATABASE_POOL_MAX_DEVELOPMENT : DATABASE_POOL_MAX_PRODUCTION;
}
