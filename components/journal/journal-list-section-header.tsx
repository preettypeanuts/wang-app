import {
  JOURNAL_LIST_SECTION_HEADER,
  JOURNAL_LIST_SECTION_LABEL,
  JOURNAL_LIST_SECTION_TOTAL_EXPENSE,
  JOURNAL_LIST_SECTION_TOTAL_INCOME,
  JOURNAL_LIST_SECTION_TOTALS,
} from "@/config/journal-table";
import { formatIdr } from "@/lib/finance/format-currency";
import { cn } from "@/lib/utils";

interface JournalListSectionHeaderProps {
  label: string;
  totalIncome: number;
  totalExpense: number;
}

export function JournalListSectionHeader({
  label,
  totalIncome,
  totalExpense,
}: JournalListSectionHeaderProps) {
  const hasIncome = totalIncome > 0;
  const hasExpense = totalExpense > 0;

  return (
    <div className={JOURNAL_LIST_SECTION_HEADER}>
      <h2 className={JOURNAL_LIST_SECTION_LABEL}>{label}</h2>
      {hasIncome || hasExpense ? (
        <div className={JOURNAL_LIST_SECTION_TOTALS}>
          {hasIncome ? (
            <span className={cn(JOURNAL_LIST_SECTION_TOTAL_INCOME)}>
              +{formatIdr(totalIncome)}
            </span>
          ) : null}
          {hasExpense ? (
            <span className={cn(JOURNAL_LIST_SECTION_TOTAL_EXPENSE)}>
              −{formatIdr(totalExpense)}
            </span>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
