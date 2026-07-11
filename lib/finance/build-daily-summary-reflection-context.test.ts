import { describe, expect, it } from "vitest";
import { computeBudgetPace } from "@/lib/finance/compute-budget-pace";
import {
  type DailySummaryReflectionContext,
  formatDailyBudgetReflectionSnippet,
  formatDailySummaryReflectionContextForPrompt,
} from "@/lib/finance/format-daily-summary-reflection-context";
import type { BudgetStatus } from "@/types/budget";

function makeMonthlyStatus(
  overrides: Partial<BudgetStatus> & Pick<BudgetStatus, "budget">,
): BudgetStatus {
  const base = {
    categoryLabel: "Makanan & Minum",
    periodMonth: "2026-07",
    dayCount: 31,
    totalLimit: 2_170_000,
    spent: 500_000,
    remaining: 1_670_000,
    usedPercent: 23,
    remainingPercent: 77,
    ...overrides,
  };

  return {
    ...base,
    pace: overrides.pace ?? computeBudgetPace(base),
  };
}

describe("formatDailySummaryReflectionContextForPrompt", () => {
  it("menyebut status over budget harian", () => {
    const context: DailySummaryReflectionContext = {
      cumulativeBalance: -91_400,
      categoryBudgets: [
        {
          category: "food",
          categoryLabel: "Makanan & Minum",
          daySpent: 91_400,
          dailyLimit: 70_000,
          dayDelta: 21_400,
          dayStatus: "over",
          monthlyStatus: makeMonthlyStatus({
            budget: {
              id: "1",
              category: "food",
              periodMonth: "2026-07",
              limitMode: "daily",
              dailyAmount: 70_000,
              fixedLimit: null,
              dayCount: 31,
              note: null,
              repeatNextMonth: true,
            },
          }),
        },
      ],
    };

    const prompt = formatDailySummaryReflectionContextForPrompt(context);

    expect(prompt).toContain("Rp91.400");
    expect(prompt).toContain("Rp70.000/hari");
    expect(prompt).toContain("MELEBIHI budget harian");
  });
});

describe("formatDailyBudgetReflectionSnippet", () => {
  it("menjelaskan kategori masih dalam budget", () => {
    const snippet = formatDailyBudgetReflectionSnippet({
      category: "food",
      categoryLabel: "Makanan & Minum",
      daySpent: 41_525,
      dailyLimit: 70_000,
      dayDelta: -28_475,
      dayStatus: "under",
      monthlyStatus: makeMonthlyStatus({
        budget: {
          id: "1",
          category: "food",
          periodMonth: "2026-07",
          limitMode: "daily",
          dailyAmount: 70_000,
          fixedLimit: null,
          dayCount: 31,
          note: null,
          repeatNextMonth: true,
        },
      }),
    });

    expect(snippet).toContain("masih dalam budget harian");
    expect(snippet).toContain("Rp41.525");
    expect(snippet).toContain("Rp70.000/hari");
  });
});
