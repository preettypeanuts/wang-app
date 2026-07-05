import type { FinanceCondition } from "@/types/summary";

interface StoredDailySummaryInsight {
  v: 1;
  insight: string;
  condition: FinanceCondition;
}

export interface ParsedDailySummaryInsight {
  insight: string | null;
  condition: FinanceCondition | null;
}

export function serializeDailySummaryInsight(
  insight: string,
  condition: FinanceCondition,
): string {
  const payload: StoredDailySummaryInsight = {
    v: 1,
    insight,
    condition,
  };

  return JSON.stringify(payload);
}

export function parseStoredDailySummaryInsight(
  raw: string | null,
): ParsedDailySummaryInsight {
  if (!raw?.trim()) {
    return { insight: null, condition: null };
  }

  try {
    const payload = JSON.parse(raw) as Partial<StoredDailySummaryInsight>;
    const insight = payload.insight?.trim();
    const label = payload.condition?.label?.trim();
    const emoji = payload.condition?.emoji?.trim();

    if (insight && label && emoji) {
      return {
        insight,
        condition: { label, emoji },
      };
    }
  } catch {
    // Legacy plain-text insight.
  }

  return {
    insight: raw.trim(),
    condition: null,
  };
}
