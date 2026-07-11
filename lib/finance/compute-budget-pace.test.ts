import { describe, expect, it } from "vitest";

import {
  computeBudgetPace,
  getBudgetPeriodProgress,
} from "@/lib/finance/compute-budget-pace";
import type { CategoryBudgetRecord } from "@/types/budget";

const referenceDate = new Date("2026-07-11T12:00:00");

function buildBudget(
  overrides: Partial<CategoryBudgetRecord> = {},
): CategoryBudgetRecord {
  return {
    id: "budget-1",
    category: "food",
    periodMonth: "2026-07",
    limitMode: "daily",
    dailyAmount: 70_000,
    fixedLimit: null,
    dayCount: null,
    note: null,
    repeatNextMonth: true,
    ...overrides,
  };
}

describe("getBudgetPeriodProgress", () => {
  it("counts elapsed and remaining days for the current month", () => {
    const progress = getBudgetPeriodProgress("2026-07", 31, referenceDate);

    expect(progress).toEqual({
      elapsedDays: 11,
      remainingDays: 20,
      isCurrentMonth: true,
      isPastMonth: false,
      isFutureMonth: false,
    });
  });

  it("marks past months as fully elapsed", () => {
    const progress = getBudgetPeriodProgress("2026-06", 30, referenceDate);

    expect(progress.elapsedDays).toBe(30);
    expect(progress.remainingDays).toBe(0);
    expect(progress.isPastMonth).toBe(true);
  });
});

describe("computeBudgetPace", () => {
  it("calculates adjusted daily budget from remaining days", () => {
    const budget = buildBudget();
    const pace = computeBudgetPace(
      {
        budget,
        periodMonth: budget.periodMonth,
        dayCount: 31,
        totalLimit: 2_170_000,
        spent: 835_425,
        remaining: 1_334_575,
      },
      referenceDate,
    );

    expect(pace.avgDailySpent).toBe(75_948);
    expect(pace.plannedDailyBudget).toBe(70_000);
    expect(pace.adjustedDailyBudget).toBe(66_729);
    expect(pace.dailyDelta).toBe(-3_271);
    expect(pace.paceStatus).toBe("fast");
  });

  it("derives planned daily budget for fixed limits", () => {
    const budget = buildBudget({
      limitMode: "fixed",
      dailyAmount: null,
      fixedLimit: 1_500_000,
    });

    const pace = computeBudgetPace(
      {
        budget,
        periodMonth: budget.periodMonth,
        dayCount: 30,
        totalLimit: 1_500_000,
        spent: 600_000,
        remaining: 900_000,
      },
      referenceDate,
    );

    expect(pace.plannedDailyBudget).toBe(50_000);
    expect(pace.adjustedDailyBudget).toBe(47_368);
  });
});
