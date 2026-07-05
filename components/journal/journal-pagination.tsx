import Link from "next/link";

import { Button } from "@/components/ui/button";
import { SEPARATED_CONTROL } from "@/config/shape";
import { buildJournalSearchParams } from "@/lib/validations/journal";
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

  return (
    <div className="flex shrink-0 flex-col gap-3 border-t border-black/6 pt-3 dark:border-white/8 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-xs text-muted-foreground">
        {total === 0
          ? "0 entri"
          : `Menampilkan ${start}–${end} dari ${total} entri`}
      </p>

      <div className="flex items-center gap-2">
        {hasPrev ? (
          <Button
            variant="outline"
            size="sm"
            nativeButton={false}
            className={SEPARATED_CONTROL}
            render={<Link href={buildPageHref(filters, page - 1)} />}
          >
            Sebelumnya
          </Button>
        ) : (
          <Button
            variant="outline"
            size="sm"
            className={SEPARATED_CONTROL}
            disabled
          >
            Sebelumnya
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
            Berikutnya
          </Button>
        ) : (
          <Button
            variant="outline"
            size="sm"
            className={SEPARATED_CONTROL}
            disabled
          >
            Berikutnya
          </Button>
        )}
      </div>
    </div>
  );
}
