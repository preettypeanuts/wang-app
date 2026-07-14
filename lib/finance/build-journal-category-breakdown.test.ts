import { describe, expect, it } from "vitest";

import { mergeUserCategoryCatalog } from "@/lib/finance/user-category-catalog";
import { buildJournalCategoryExpenseBreakdown } from "@/lib/finance/build-journal-category-breakdown";
import type { UserCategoryRecord } from "@/types/user-category";

describe("buildJournalCategoryExpenseBreakdown", () => {
  it("uses user catalog labels for custom categories", () => {
    const overrides: UserCategoryRecord[] = [
      {
        id: "cat-1",
        userId: "user-1",
        slug: "custom_abc123",
        label: "Langganan App",
        icon: "sparkles",
        accent: { light: "#E8F4FF", dark: "#1A2A3A" },
        type: "expense",
        baseCategoryId: null,
        hidden: false,
        sortOrder: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    const catalog = mergeUserCategoryCatalog(overrides);
    const breakdown = buildJournalCategoryExpenseBreakdown(
      [
        { category: "food", amount: 100_000 },
        { category: "custom_abc123", amount: 50_000 },
      ],
      catalog,
    );

    expect(breakdown.totalExpense).toBe(150_000);
    expect(breakdown.categories).toEqual([
      {
        category: "food",
        label: "Makanan & Minum",
        amount: 100_000,
        percent: 67,
      },
      {
        category: "custom_abc123",
        label: "Langganan App",
        amount: 50_000,
        percent: 33,
      },
    ]);
  });

  it("uses overridden built-in labels from the catalog", () => {
    const overrides: UserCategoryRecord[] = [
      {
        id: "cat-2",
        userId: "user-1",
        slug: "food",
        label: "Jajan",
        icon: "fork-knife",
        accent: { light: "#FFE8E8", dark: "#3A1A1A" },
        type: "expense",
        baseCategoryId: "food",
        hidden: false,
        sortOrder: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    const catalog = mergeUserCategoryCatalog(overrides);
    const breakdown = buildJournalCategoryExpenseBreakdown(
      [{ category: "food", amount: 25_000 }],
      catalog,
    );

    expect(breakdown.categories[0]?.label).toBe("Jajan");
  });
});
