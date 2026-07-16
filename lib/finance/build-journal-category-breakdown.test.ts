import { describe, expect, it } from "vitest";

import { buildJournalCategoryExpenseBreakdown } from "@/lib/finance/build-journal-category-breakdown";
import { mergeUserCategoryCatalog } from "@/lib/finance/user-category-catalog";
import type { UserCategoryRecord } from "@/types/user-category";

function buildRecord(
  partial: Partial<UserCategoryRecord> & Pick<UserCategoryRecord, "slug" | "label">,
): UserCategoryRecord {
  return {
    id: partial.id ?? "cat-1",
    userId: partial.userId ?? "user-1",
    slug: partial.slug,
    label: partial.label,
    icon: partial.icon ?? "dots-three",
    iconIsCustom: partial.iconIsCustom ?? false,
    accentLight: partial.accentLight ?? "#F2F2F2",
    accentDark: partial.accentDark ?? "#3A3A3C",
    colorIsCustom: partial.colorIsCustom ?? false,
    type: partial.type ?? "expense",
    baseCategoryId: partial.baseCategoryId ?? null,
    hidden: partial.hidden ?? false,
    sortOrder: partial.sortOrder ?? 0,
  };
}

describe("buildJournalCategoryExpenseBreakdown", () => {
  it("uses user catalog labels for custom categories", () => {
    const overrides = [
      buildRecord({
        slug: "custom_abc123",
        label: "Langganan App",
        icon: "sparkle",
        iconIsCustom: true,
      }),
    ];

    const catalog = mergeUserCategoryCatalog(overrides);
    const breakdown = buildJournalCategoryExpenseBreakdown(
      [
        { category: "food", amount: 100_000 },
        { category: "custom_abc123", amount: 50_000 },
      ],
      catalog,
      overrides,
    );

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
    const overrides = [
      buildRecord({
        slug: "food",
        label: "Jajan",
        icon: "fork-knife",
        baseCategoryId: "food",
      }),
    ];

    const catalog = mergeUserCategoryCatalog(overrides);
    const breakdown = buildJournalCategoryExpenseBreakdown(
      [{ category: "food", amount: 25_000 }],
      catalog,
      overrides,
    );

    expect(breakdown.categories[0]?.label).toBe("Jajan");
  });

  it("uses hidden built-in override labels for legacy other transactions", () => {
    const overrides = [
      buildRecord({
        slug: "other",
        label: "Asset",
        baseCategoryId: "other",
        hidden: true,
      }),
    ];

    const catalog = mergeUserCategoryCatalog(overrides);
    const breakdown = buildJournalCategoryExpenseBreakdown(
      [{ category: "other", amount: 75_000 }],
      catalog,
      overrides,
    );

    expect(breakdown.categories[0]?.label).toBe("Asset");
  });
});
