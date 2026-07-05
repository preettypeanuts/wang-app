import { JournalFiltersBar } from "@/components/journal/journal-filters-bar";
import { JournalPagination } from "@/components/journal/journal-pagination";
import { JournalShell } from "@/components/journal/journal-shell";
import { JournalSummaryWidget } from "@/components/journal/journal-summary-widget";
import { JournalTable } from "@/components/journal/journal-table";
import { MobileBackButton } from "@/components/shared/mobile-back-button";
import { APP_GUTTER, STACK_GAP } from "@/config/spacing";
import { getJournalDaySummary } from "@/lib/db/journal-summary";
import { listJournalTransactions } from "@/lib/db/journal";
import { parseJournalSearchParams } from "@/lib/validations/journal";
import { formatJournalHeaderDate } from "@/lib/finance/format-datetime";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

interface JournalPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function JournalPage({ searchParams }: JournalPageProps) {
  const params = await searchParams;
  const filters = parseJournalSearchParams(params);
  const [result, daySummary] = await Promise.all([
    listJournalTransactions(filters),
    getJournalDaySummary(),
  ]);

  return (
    <div className={cn("flex h-full min-h-0 flex-1 flex-col", APP_GUTTER)}>
      <JournalShell>
        <div className={cn("flex min-h-0 flex-1 flex-col", STACK_GAP)}>
          <header className="shrink-0">
            <div className="flex items-start justify-between gap-4">
              <div className="flex min-w-0 items-start gap-2">
                <MobileBackButton className="mt-0.5 shrink-0 md:hidden" />
                <div className="min-w-0">
                  <h1 className="mt-1 text-lg font-semibold tracking-tight">
                    Journal
                  </h1>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Semua transaksi tercatat dari inbox.
                  </p>
                </div>
              </div>
              <p className="shrink-0 text-right text-sm font-semibold capitalize text-foreground/90">
                {formatJournalHeaderDate(daySummary.date)}
              </p>
            </div>
          </header>

          <JournalSummaryWidget summary={daySummary} className="shrink-0" />

          <JournalFiltersBar filters={filters} />

          <JournalTable items={result.items} />

          <JournalPagination
            page={result.page}
            totalPages={result.totalPages}
            total={result.total}
            pageSize={result.pageSize}
            filters={filters}
          />
        </div>
      </JournalShell>
    </div>
  );
}
