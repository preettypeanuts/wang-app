"use client";

import { JournalCategoryBreakdownRow } from "@/components/journal/journal-category-breakdown-row";
import { JOURNAL_CATEGORY_BREAKDOWN_SHELL } from "@/config/journal-mobile";
import {
  UI_LABEL_EXPENSE_BY_CATEGORY,
  UI_LABEL_EXPENSE_BY_CATEGORY_DESC,
  UI_LABEL_TOTAL,
} from "@/config/ui-labels";
import { useProtectedCurrency } from "@/hooks/use-protected-currency";
import { cn } from "@/lib/utils";
import type { JournalCategoryExpenseBreakdown } from "@/types/journal";

interface JournalCategoryBreakdownProps {
  breakdown: JournalCategoryExpenseBreakdown;
  className?: string;
}

export function JournalCategoryBreakdown({
  breakdown,
  className,
}: JournalCategoryBreakdownProps) {
  const { formatAmount } = useProtectedCurrency();

  if (breakdown.categories.length === 0) {
    return null;
  }

  return (
    <section className={cn(JOURNAL_CATEGORY_BREAKDOWN_SHELL, className)}>
      <div className="mb-3 flex items-end justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold">{UI_LABEL_EXPENSE_BY_CATEGORY}</h3>
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            {UI_LABEL_EXPENSE_BY_CATEGORY_DESC}
          </p>
        </div>
        <p className="shrink-0 text-right text-[11px] text-muted-foreground">
          <span className="block font-medium text-foreground">{UI_LABEL_TOTAL}</span>
          <span className="tabular-nums">{formatAmount(breakdown.totalExpense)}</span>
        </p>
      </div>

      <div className="space-y-3.5">
        {breakdown.categories.map((item) => (
          <JournalCategoryBreakdownRow
            formatAmount={formatAmount}
            item={item}
            key={item.category}
          />
        ))}
      </div>
    </section>
  );
}
