import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  JOURNAL_PAGINATION_BUTTON_MOBILE,
  JOURNAL_PAGINATION_COUNT_MOBILE,
  JOURNAL_PAGINATION_MOBILE,
  JOURNAL_PAGINATION_NAV_MOBILE,
  JOURNAL_PAGINATION_PAGE_MOBILE,
} from "@/config/journal-mobile";
import { SEPARATED_CONTROL } from "@/config/shape";
import {
  formatJournalPageLabel,
  formatJournalPaginationCount,
  UI_LABEL_ENTRIES_ZERO,
  UI_LABEL_NEXT,
  UI_LABEL_PREVIOUS,
} from "@/config/ui-labels";
import { buildJournalSearchParams } from "@/lib/validations/journal";
import { cn } from "@/lib/utils";
import type { JournalFilters } from "@/types/journal";

interface JournalPaginationProps {
  page: number;
  totalPages: number;
  total: number;
  pageSize: number;
  filters: JournalFilters;
}

function buildPageHref(filters: JournalFilters, page: number): string {
  const params = buildJournalSearchParams(filters, page);
  const query = params.toString();
  return query ? `/journal?${query}` : "/journal";
}

export function JournalPagination({
  page,
  totalPages,
  total,
  pageSize,
  filters,
}: JournalPaginationProps) {
  const start = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);
  const hasPrev = page > 1;
  const hasNext = page < totalPages;
  const countLabel =
    total === 0
      ? UI_LABEL_ENTRIES_ZERO
      : formatJournalPaginationCount(start, end, total);
  const pageLabel = formatJournalPageLabel(page, totalPages);

  return (
      <div
        className={cn(
          "flex shrink-0 flex-col gap-3 border-t border-black/6 pt-3 dark:border-white/8 md:flex-row md:items-center md:justify-between",
          JOURNAL_PAGINATION_MOBILE,
        )}
      >
      <p className={cn("text-xs text-muted-foreground", JOURNAL_PAGINATION_COUNT_MOBILE)}>
        {countLabel}
      </p>

      <div className={cn("flex flex-col gap-2 md:hidden")}>
        <div className={JOURNAL_PAGINATION_NAV_MOBILE}>
          {hasPrev ? (
            <Button
              variant="outline"
              nativeButton={false}
              className={cn(SEPARATED_CONTROL, JOURNAL_PAGINATION_BUTTON_MOBILE)}
              render={<Link href={buildPageHref(filters, page - 1)} />}
            >
              {UI_LABEL_PREVIOUS}
            </Button>
          ) : (
            <Button
              variant="outline"
              className={cn(SEPARATED_CONTROL, JOURNAL_PAGINATION_BUTTON_MOBILE)}
              disabled
            >
              {UI_LABEL_PREVIOUS}
            </Button>
          )}

          {hasNext ? (
            <Button
              variant="outline"
              nativeButton={false}
              className={cn(SEPARATED_CONTROL, JOURNAL_PAGINATION_BUTTON_MOBILE)}
              render={<Link href={buildPageHref(filters, page + 1)} />}
            >
              {UI_LABEL_NEXT}
            </Button>
          ) : (
            <Button
              variant="outline"
              className={cn(SEPARATED_CONTROL, JOURNAL_PAGINATION_BUTTON_MOBILE)}
              disabled
            >
              {UI_LABEL_NEXT}
            </Button>
          )}
        </div>

        <p className={cn("text-xs tabular-nums text-muted-foreground", JOURNAL_PAGINATION_PAGE_MOBILE)}>
          {pageLabel}
        </p>
      </div>

      <div className="hidden items-center gap-2 md:flex">
        {hasPrev ? (
          <Button
            variant="outline"
            size="sm"
            nativeButton={false}
            className={SEPARATED_CONTROL}
            render={<Link href={buildPageHref(filters, page - 1)} />}
          >
            {UI_LABEL_PREVIOUS}
          </Button>
        ) : (
          <Button variant="outline" size="sm" className={SEPARATED_CONTROL} disabled>
            {UI_LABEL_PREVIOUS}
          </Button>
        )}
        <span className="min-w-20 text-center text-xs tabular-nums text-muted-foreground">
          {page} / {totalPages}
        </span>
        {hasNext ? (
          <Button
            variant="outline"
            size="sm"
            nativeButton={false}
            className={SEPARATED_CONTROL}
            render={<Link href={buildPageHref(filters, page + 1)} />}
          >
            {UI_LABEL_NEXT}
          </Button>
        ) : (
          <Button variant="outline" size="sm" className={SEPARATED_CONTROL} disabled>
            {UI_LABEL_NEXT}
          </Button>
        )}
      </div>
    </div>
  );
}
