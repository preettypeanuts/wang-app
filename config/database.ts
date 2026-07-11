/**
 * Postgres connection budget — app usage must stay ≤ 10 connections total.
 *
 * Per-process pool size × concurrent Node processes should not exceed the budget.
 * Example prod: 2 connections × 5 serverless instances = 10.
 * Example dev: 2 connections × a few Turbopack workers should stay under 10.
 */

/** Hard cap for app pools (dev + prod). Never exceed via env override. */
export const DATABASE_APP_CONNECTION_BUDGET = 8;

/** Per-process pool in local development. */
export const DATABASE_POOL_MAX_DEVELOPMENT = 2;

/** Per-instance pool in production (serverless / multi-process). */
export const DATABASE_POOL_MAX_PRODUCTION = 1;

export function resolveDatabasePoolMax(isDev: boolean): number {
  const override = process.env.DATABASE_POOL_MAX?.trim();
  const defaultMax = isDev
    ? DATABASE_POOL_MAX_DEVELOPMENT
    : DATABASE_POOL_MAX_PRODUCTION;

  if (override) {
    const parsed = Number.parseInt(override, 10);

    if (Number.isFinite(parsed) && parsed > 0) {
      return Math.min(parsed, DATABASE_APP_CONNECTION_BUDGET);
    }
  }

  return Math.min(defaultMax, DATABASE_APP_CONNECTION_BUDGET);
}
