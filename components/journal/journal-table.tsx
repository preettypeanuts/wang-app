import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { JournalTypeBadge } from "@/components/journal/journal-type-badge";
import {
  JOURNAL_CATEGORY_PILL,
  JOURNAL_EMPTY_STATE,
  JOURNAL_TABLE_CELL,
  JOURNAL_TABLE_CONTAINER,
  JOURNAL_TABLE_HEAD,
  JOURNAL_TABLE_HEADER,
  JOURNAL_TABLE_ROW,
  JOURNAL_TABLE_SCROLL,
} from "@/config/journal-table";
import { CATEGORY_LABELS } from "@/lib/finance/categories";
import {
  formatJournalDate,
  formatJournalTime,
} from "@/lib/finance/format-datetime";
import { formatIdr } from "@/lib/finance/format-currency";
import { cn } from "@/lib/utils";
import type { JournalEntry } from "@/types/journal";

interface JournalTableProps {
  items: JournalEntry[];
}

export function JournalTable({ items }: JournalTableProps) {
  if (items.length === 0) {
    return (
      <div className={JOURNAL_EMPTY_STATE}>
        <p className="text-sm font-medium">Belum ada transaksi</p>
        <p className="mt-1 max-w-sm text-xs text-muted-foreground">
          Catat lewat inbox atau ubah filter untuk melihat entri lain.
        </p>
      </div>
    );
  }

  return (
    <div className={JOURNAL_TABLE_CONTAINER}>
      <div className={JOURNAL_TABLE_SCROLL}>
        <Table className="">
        <TableHeader className={JOURNAL_TABLE_HEADER}>
          <TableRow className="border-0 hover:bg-transparent">
            <TableHead className={cn(JOURNAL_TABLE_HEAD, "w-[9.5rem]")}>
              Waktu
            </TableHead>
            <TableHead className={cn(JOURNAL_TABLE_HEAD, "w-[7.5rem]")}>
              Tipe
            </TableHead>
            <TableHead className={cn(JOURNAL_TABLE_HEAD, "w-[7rem]")}>
              Kategori
            </TableHead>
            <TableHead className={JOURNAL_TABLE_HEAD}>Pesan inbox</TableHead>
            <TableHead
              className={cn(JOURNAL_TABLE_HEAD, "w-[9rem] text-right")}
            >
              Nominal
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => {
            const isIncome = item.type === "income";
            const categoryLabel =
              CATEGORY_LABELS[item.category] ?? CATEGORY_LABELS.other;

            return (
              <TableRow key={item.id} className={JOURNAL_TABLE_ROW}>
                <TableCell className={JOURNAL_TABLE_CELL}>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs font-medium text-foreground/90">
                      {formatJournalDate(item.occurredAt)}
                    </span>
                    <span className="text-[11px] tabular-nums text-muted-foreground">
                      {formatJournalTime(item.occurredAt)}
                    </span>
                  </div>
                </TableCell>
                <TableCell className={JOURNAL_TABLE_CELL}>
                  <JournalTypeBadge type={item.type} />
                </TableCell>
                <TableCell className={JOURNAL_TABLE_CELL}>
                  <span className={JOURNAL_CATEGORY_PILL}>{categoryLabel}</span>
                </TableCell>
                <TableCell className={cn(JOURNAL_TABLE_CELL, "max-w-0")}>
                  <p className="truncate text-sm text-foreground/85">
                    {item.rawInput}
                  </p>
                </TableCell>
                <TableCell
                  className={cn(
                    JOURNAL_TABLE_CELL,
                    "text-right text-sm font-semibold tabular-nums",
                    isIncome
                      ? "text-[#2FAE52] dark:text-[#34C759]"
                      : "text-foreground/90",
                  )}
                >
                  {isIncome ? "+" : "−"}
                  {formatIdr(item.amount)}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
        </Table>
      </div>
    </div>
  );
}
