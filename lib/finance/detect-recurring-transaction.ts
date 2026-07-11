import { extractCategoryKeyword } from "@/lib/finance/extract-category-keyword";
import { prisma } from "@/lib/db/prisma";
import type { ParsedTransaction, TransactionType } from "@/types/transaction";

const LOOKBACK_MONTHS = 6;
const MIN_HISTORICAL_MATCHES = 2;
const AMOUNT_TOLERANCE = 0.15;
/** Monthly cadence: ~28–31 days with ±3 day slack → 25–34. */
const MONTHLY_INTERVAL_MIN_DAYS = 25;
const MONTHLY_INTERVAL_MAX_DAYS = 34;
const MS_PER_DAY = 24 * 60 * 60 * 1000;

export interface RecurringSuggestion {
  keyword: string;
  averageAmount: number;
  category: string;
  flowType: TransactionType;
  suggestedRepeat: "monthly";
  matchCount: number;
}

interface HistoricalTransaction {
  amount: number;
  description: string;
  occurredAt: Date;
  category: string;
}

/** True when amount is within ±15% of the reference amount. */
export function isAmountWithinTolerance(
  amount: number,
  referenceAmount: number,
  tolerance = AMOUNT_TOLERANCE,
): boolean {
  if (referenceAmount <= 0) {
    return false;
  }

  const delta = Math.abs(amount - referenceAmount) / referenceAmount;
  return delta <= tolerance;
}

export function descriptionMatchesKeyword(
  description: string,
  keyword: string,
): boolean {
  if (!keyword) {
    return false;
  }

  const lower = description.toLowerCase();
  if (lower.includes(keyword.toLowerCase())) {
    return true;
  }

  return extractCategoryKeyword(description) === keyword;
}

export function daysBetween(a: Date, b: Date): number {
  return Math.abs(a.getTime() - b.getTime()) / MS_PER_DAY;
}

export function isMonthlyInterval(days: number): boolean {
  return days >= MONTHLY_INTERVAL_MIN_DAYS && days <= MONTHLY_INTERVAL_MAX_DAYS;
}

/**
 * Given candidate dates (newest last or unsorted), check that consecutive
 * intervals are consistently monthly (~28–31 ±3 days). Needs ≥3 dates.
 */
export function hasConsistentMonthlyCadence(dates: Date[]): boolean {
  if (dates.length < 3) {
    return false;
  }

  const sorted = [...dates].sort((a, b) => a.getTime() - b.getTime());

  for (let i = 1; i < sorted.length; i += 1) {
    const gap = daysBetween(sorted[i - 1], sorted[i]);
    if (!isMonthlyInterval(gap)) {
      return false;
    }
  }

  return true;
}

export function averageAmount(amounts: number[]): number {
  if (amounts.length === 0) {
    return 0;
  }

  const sum = amounts.reduce((total, value) => total + value, 0);
  return Math.round(sum / amounts.length);
}

function lookbackStart(from: Date): Date {
  const start = new Date(from);
  start.setMonth(start.getMonth() - LOOKBACK_MONTHS);
  return start;
}

async function hasDismissedSuggestion(
  userId: string,
  keyword: string,
): Promise<boolean> {
  const row = await prisma.recurringSuggestionDismissal.findUnique({
    where: {
      userId_keyword: { userId, keyword },
    },
    select: { id: true },
  });

  return Boolean(row);
}

async function hasMatchingActivePlannedItem(
  userId: string,
  keyword: string,
  category: string,
  flowType: TransactionType,
): Promise<boolean> {
  const now = new Date();
  const items = await prisma.plannedItem.findMany({
    where: {
      userId,
      flowType,
      category,
      OR: [{ endAt: null }, { endAt: { gte: now } }],
    },
    select: {
      name: true,
      category: true,
    },
  });

  return items.some((item) => {
    const nameLower = item.name.toLowerCase();
    if (nameLower.includes(keyword.toLowerCase())) {
      return true;
    }

    return extractCategoryKeyword(item.name) === keyword;
  });
}

function pickBestHistoricalMatches(
  history: HistoricalTransaction[],
  keyword: string,
  referenceAmount: number,
): HistoricalTransaction[] {
  return history.filter(
    (row) =>
      descriptionMatchesKeyword(row.description, keyword) &&
      isAmountWithinTolerance(row.amount, referenceAmount),
  );
}

/**
 * Detect a monthly recurring pattern for a newly saved transaction.
 * Needs ≥2 prior matches (3 total) with ~monthly spacing; skips dismissed
 * keywords and overlapping active PlannedItems.
 */
export async function detectRecurringPattern(
  userId: string,
  transaction: ParsedTransaction,
): Promise<RecurringSuggestion | null> {
  const keyword = extractCategoryKeyword(transaction.description);
  if (!keyword) {
    return null;
  }

  if (await hasDismissedSuggestion(userId, keyword)) {
    return null;
  }

  if (
    await hasMatchingActivePlannedItem(
      userId,
      keyword,
      transaction.category,
      transaction.type,
    )
  ) {
    return null;
  }

  const occurredAt = new Date(transaction.occurredAt);
  if (Number.isNaN(occurredAt.getTime())) {
    return null;
  }

  const history = await prisma.transaction.findMany({
    where: {
      userId,
      type: transaction.type,
      category: transaction.category,
      occurredAt: {
        gte: lookbackStart(occurredAt),
        lt: occurredAt,
      },
      ...(transaction.id
        ? { id: { not: transaction.id } }
        : {}),
    },
    orderBy: { occurredAt: "desc" },
    select: {
      amount: true,
      description: true,
      occurredAt: true,
      category: true,
    },
  });

  const matches = pickBestHistoricalMatches(
    history,
    keyword,
    transaction.amount,
  );

  if (matches.length < MIN_HISTORICAL_MATCHES) {
    return null;
  }

  // Walk backwards from the new transaction, collecting monthly-spaced matches.
  const sortedAsc = [...matches].sort(
    (a, b) => a.occurredAt.getTime() - b.occurredAt.getTime(),
  );
  const chain: HistoricalTransaction[] = [];
  let cursor = occurredAt;

  for (
    let i = sortedAsc.length - 1;
    i >= 0 && chain.length < MIN_HISTORICAL_MATCHES;
    i -= 1
  ) {
    const gap = daysBetween(sortedAsc[i].occurredAt, cursor);
    if (!isMonthlyInterval(gap)) {
      continue;
    }
    chain.unshift(sortedAsc[i]);
    cursor = sortedAsc[i].occurredAt;
  }

  if (chain.length < MIN_HISTORICAL_MATCHES) {
    return null;
  }

  const amounts = [...chain.map((row) => row.amount), transaction.amount];

  return {
    keyword,
    averageAmount: averageAmount(amounts),
    category: transaction.category,
    flowType: transaction.type,
    suggestedRepeat: "monthly",
    matchCount: amounts.length,
  };
}
