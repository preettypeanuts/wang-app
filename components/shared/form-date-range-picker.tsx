"use client";

import type { DateRange } from "react-day-picker";

import { Calendar } from "@/components/ui/calendar";
import {
  dateInputFromCalendarDate,
  parseDayKey,
} from "@/lib/finance/day-range";
import { formatJournalDate } from "@/lib/finance/format-datetime";
import { cn } from "@/lib/utils";

interface FormDateRangePickerProps {
  dateFrom: string;
  dateTo: string;
  onChange: (dateFrom: string, dateTo: string) => void;
  className?: string;
}

function rangeFromInputs(from: string, to: string): DateRange | undefined {
  const fromDate =
    from && /^\d{4}-\d{2}-\d{2}$/.test(from) ? parseDayKey(from) : undefined;
  const toDate =
    to && /^\d{4}-\d{2}-\d{2}$/.test(to) ? parseDayKey(to) : undefined;

  if (!fromDate && !toDate) {
    return undefined;
  }

  return { from: fromDate, to: toDate };
}

function formatRangeLabel(from: string, to: string): string {
  if (from && to) {
    return `${formatJournalDate(parseDayKey(from))} – ${formatJournalDate(parseDayKey(to))}`;
  }

  if (from) {
    return `Dari ${formatJournalDate(parseDayKey(from))}`;
  }

  if (to) {
    return `Sampai ${formatJournalDate(parseDayKey(to))}`;
  }

  return "Pilih rentang tanggal";
}

export function FormDateRangePicker({
  dateFrom,
  dateTo,
  onChange,
  className,
}: FormDateRangePickerProps) {
  const selected = rangeFromInputs(dateFrom, dateTo);
  const defaultMonth = selected?.from ?? selected?.to ?? new Date();

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <p
        className={cn(
          "text-center text-sm font-medium",
          !dateFrom && !dateTo && "text-muted-foreground",
        )}
      >
        {formatRangeLabel(dateFrom, dateTo)}
      </p>
      <Calendar
        mode="range"
        selected={selected}
        defaultMonth={defaultMonth}
        numberOfMonths={1}
        onSelect={(range) => {
          onChange(
            range?.from ? dateInputFromCalendarDate(range.from) : "",
            range?.to ? dateInputFromCalendarDate(range.to) : "",
          );
        }}
        className="mx-auto rounded-xl border border-black/8 bg-white/70 p-2 dark:border-white/12 dark:bg-white/8"
      />
    </div>
  );
}
