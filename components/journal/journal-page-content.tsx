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
import { SEPARATED_CONTROL } from "@/config/shape";
import { STACK_GAP } from "@/config/spacing";
import { formatJournalHeaderDate } from "@/lib/finance/format-datetime";
import { PlusIcon } from "@/lib/icons";
import { cn } from "@/lib/utils";
import type {
  JournalCategoryExpenseBreakdown,
  JournalDaySummary,
  JournalFilters,
  JournalListResult,
} from "@/types/journal";

interface JournalPageContentProps {
  result: JournalListResult;
  daySummary: JournalDaySummary;
  categoryBreakdown: JournalCategoryExpenseBreakdown;
  filters: JournalFilters;
}

export function JournalPageContent({
  result,
  daySummary,
  categoryBreakdown,
  filters,
}: JournalPageContentProps) {
  const [createOpen, setCreateOpen] = useState(false);

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
                  Semua transaksi — dari inbox atau input manual.
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                <p className="text-right text-sm font-semibold capitalize text-foreground/90">
                  {formatJournalHeaderDate(daySummary.date)}
                </p>
                <Button
                  type="button"
                  className={cn(SEPARATED_CONTROL, "h-9 gap-1.5 px-3")}
                  onClick={() => setCreateOpen(true)}
                >
                  <PlusIcon aria-hidden className="size-4" />
                  Tambah
                </Button>
              </div>
            </div>
          </header>

          <div className="flex items-center justify-between gap-3 max-md:-mt-1 md:hidden">
            <p className="text-[11px] text-muted-foreground">
              Semua transaksi — dari inbox atau input manual.
            </p>
            <p className="shrink-0 text-[11px] font-semibold capitalize text-foreground/90">
              {formatJournalHeaderDate(daySummary.date)}
            </p>
          </div>

          <JournalSummaryWidget summary={daySummary} className="shrink-0" />

          <div className="shrink-0">
            <JournalFiltersBar filters={filters} />
          </div>

          <JournalTable items={result.items} onAdd={() => setCreateOpen(true)} />

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
