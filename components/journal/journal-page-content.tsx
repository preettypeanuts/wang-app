"use client";

import { useState } from "react";

import { JournalCategoryBreakdown } from "@/components/journal/journal-category-breakdown";
import { JournalAddFab } from "@/components/journal/journal-add-fab";
import { JournalEntryCreateDialog } from "@/components/journal/journal-entry-create-dialog";
import { JournalFiltersBar } from "@/components/journal/journal-filters-bar";
import { JournalPagination } from "@/components/journal/journal-pagination";
import { JournalShell } from "@/components/journal/journal-shell";
import { JournalSummaryWidget } from "@/components/journal/journal-summary-widget";
import { JournalTable } from "@/components/journal/journal-table";
import { MobileScrollSurface } from "@/components/shared/mobile-scroll-surface";
import { Button } from "@/components/ui/button";
import { JOURNAL_DESKTOP_SCROLL_SURFACE } from "@/config/journal-desktop";
import { JOURNAL_DESKTOP_SCROLL_TRAIL } from "@/config/journal-desktop";
import { UI_LABEL_ADD } from "@/config/ui-labels";
import { SEPARATED_CONTROL } from "@/config/shape";
import { STACK_GAP } from "@/config/spacing";
import { useRefreshOnTabActive } from "@/hooks/use-refresh-on-tab-active";
import {
  formatPlannerMonthLabel,
  getCurrentMonthKey,
} from "@/lib/planner/calendar";
import { PlusIcon } from "@/lib/icons";
import { cn } from "@/lib/utils";
import type { JournalWalletOption } from "@/components/journal/journal-filters-drawer";
import type {
  JournalCategoryExpenseBreakdown,
  JournalDaySummary,
  JournalFilters,
  JournalListResult,
} from "@/types/journal";

function getJournalPeriodHeading(summary: JournalDaySummary): string {
  if (summary.periodLabel) {
    return summary.periodLabel;
  }

  return formatPlannerMonthLabel(getCurrentMonthKey(summary.date));
}

interface JournalPageContentProps {
  result: JournalListResult;
  daySummary: JournalDaySummary;
  categoryBreakdown: JournalCategoryExpenseBreakdown;
  filters: JournalFilters;
  walletOptions?: JournalWalletOption[];
}

export function JournalPageContent({
  result,
  daySummary,
  categoryBreakdown,
  filters,
  walletOptions,
}: JournalPageContentProps) {
  const [createOpen, setCreateOpen] = useState(false);
  useRefreshOnTabActive();

  return (
    <div className={cn("flex min-h-0 flex-1 flex-col")}>
      <JournalShell className="min-h-0 flex-1">
        <MobileScrollSurface
          className={cn(
            "flex min-h-0 flex-1 flex-col",
            STACK_GAP,
            "max-md:overflow-y-auto max-md:overscroll-y-contain",
            JOURNAL_DESKTOP_SCROLL_SURFACE,
          )}
          title="Journal"
        >
          <header className="shrink-0 max-md:hidden md:pt-3">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <h1 className="mt-1 text-lg font-semibold tracking-tight">
                  Journal
                </h1>
                <p className="mt-1 text-xs text-muted-foreground">
                  All transactions — from inbox or manual entry.
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                <p className="text-right text-sm font-semibold text-foreground/90">
                  {getJournalPeriodHeading(daySummary)}
                </p>
                <Button
                  type="button"
                  className={cn(SEPARATED_CONTROL, "h-9 gap-1.5 px-3")}
                  onClick={() => setCreateOpen(true)}
                >
                  <PlusIcon aria-hidden className="size-4" />
                  {UI_LABEL_ADD}
                </Button>
              </div>
            </div>
          </header>

          <div className="flex items-center justify-between gap-3 max-md:-mt-1 md:hidden">
            <p className="text-[11px] text-muted-foreground">
              All transactions — from inbox or manual entry.
            </p>
            <p className="shrink-0 text-[11px] font-semibold text-foreground/90">
              {getJournalPeriodHeading(daySummary)}
            </p>
          </div>

          <JournalSummaryWidget summary={daySummary} className="shrink-0" />

          <div className="shrink-0">
            <JournalFiltersBar filters={filters} walletOptions={walletOptions} />
          </div>

          <JournalTable
            items={result.items}
            walletOptions={walletOptions}
            onAdd={() => setCreateOpen(true)}
          />

          <JournalPagination
            page={result.page}
            totalPages={result.totalPages}
            total={result.total}
            pageSize={result.pageSize}
            filters={filters}
          />

          <JournalCategoryBreakdown breakdown={categoryBreakdown} />

          <div
            aria-hidden
            className={cn("hidden md:block", JOURNAL_DESKTOP_SCROLL_TRAIL)}
          />
        </MobileScrollSurface>
      </JournalShell>

      <JournalAddFab onClick={() => setCreateOpen(true)} />
      <JournalEntryCreateDialog open={createOpen} onOpenChange={setCreateOpen} />
    </div>
  );
}
