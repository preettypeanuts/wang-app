import { describe, expect, it } from "vitest";

import { getBudgetStatusBadge } from "@/config/budget";

describe("getBudgetStatusBadge", () => {
  it("returns Safe when plenty remains and daily pace is still on plan", () => {
    const badge = getBudgetStatusBadge(55, {
      isCurrentMonth: true,
      adjustedDailyBudget: 75_000,
      plannedDailyBudget: 70_000,
    });

    expect(badge.label).toBe("Safe");
  });

  it("returns Aware when remaining budget is healthy but daily allowance is below plan", () => {
    const badge = getBudgetStatusBadge(55, {
      isCurrentMonth: true,
      adjustedDailyBudget: 51_464,
      plannedDailyBudget: 70_000,
    });

    expect(badge.label).toBe("Aware");
  });

  it("does not downgrade to Aware outside the current month", () => {
    const badge = getBudgetStatusBadge(55, {
      isCurrentMonth: false,
      adjustedDailyBudget: 51_464,
      plannedDailyBudget: 70_000,
    });

    expect(badge.label).toBe("Safe");
  });

  it("keeps Almost depleted ahead of Aware", () => {
    const badge = getBudgetStatusBadge(15, {
      isCurrentMonth: true,
      adjustedDailyBudget: 40_000,
      plannedDailyBudget: 70_000,
    });

    expect(badge.label).toBe("Almost depleted");
  });
});
