"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import type { DateRange } from "react-day-picker";

import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { JOURNAL_DATE_RANGE_TRIGGER } from "@/config/journal-mobile";
import { useIsMobileViewport } from "@/hooks/use-is-mobile-viewport";
import {
  dateInputFromCalendarDate,
  parseDateOnlyInput,
} from "@/lib/finance/day-range";
import {
  formatJournalPeriodLabel,
  getDefaultJournalDateRange,
  getLast30DaysJournalDateRange,
  getLastMonthJournalDateRange,
  type JournalDateRange,
} from "@/lib/finance/journal-period";
import { CalendarBlankIcon } from "@/lib/icons";
import { buildJournalSearchParams } from "@/lib/validations/journal";
import { cn } from "@/lib/utils";
import type { JournalFilters } from "@/types/journal";

interface JournalDateRangePickerProps {
  filters: JournalFilters;
  className?: string;
}

function toCalendarRange(filters: JournalFilters): DateRange | undefined {
  const from = parseDateOnlyInput(filters.from);
  const to = parseDateOnlyInput(filters.to);

  if (!from) {
    return undefined;
  }

  return { from, to: to ?? from };
}

const PRESETS: { id: string; label: string; resolve: () => JournalDateRange }[] =
  [
    {
      id: "this-month",
      label: "Bulan ini",
      resolve: getDefaultJournalDateRange,
    },
    {
      id: "last-month",
      label: "Bulan lalu",
      resolve: getLastMonthJournalDateRange,
    },
    {
      id: "last-30-days",
      label: "30 hari",
      resolve: getLast30DaysJournalDateRange,
    },
  ];

function JournalDateRangePanel({
  filters,
  draftRange,
  onDraftRangeChange,
  onApplyPreset,
  onApplyRange,
}: {
  filters: JournalFilters;
  draftRange: DateRange | undefined;
  onDraftRangeChange: (range: DateRange | undefined) => void;
  onApplyPreset: (range: JournalDateRange) => void;
  onApplyRange: (range: JournalDateRange) => void;
}) {
  const selectedRange = draftRange ?? toCalendarRange(filters);
  const defaultMonth =
    selectedRange?.to ?? selectedRange?.from ?? new Date();

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-2">
        {PRESETS.map((preset) => (
          <Button
            key={preset.id}
            type="button"
            size="sm"
            variant="outline"
            className="h-8 rounded-full px-3 text-xs"
            onClick={() => onApplyPreset(preset.resolve())}
          >
            {preset.label}
          </Button>
        ))}
      </div>

      <Calendar
        mode="range"
        numberOfMonths={1}
        defaultMonth={defaultMonth}
        selected={selectedRange}
        onSelect={(range) => {
          onDraftRangeChange(range);

          if (range?.from && range?.to) {
            onApplyRange({
              from: dateInputFromCalendarDate(range.from),
              to: dateInputFromCalendarDate(range.to),
            });
          }
        }}
      />
    </div>
  );
}

export function JournalDateRangePicker({
  filters,
  className,
}: JournalDateRangePickerProps) {
  const router = useRouter();
  const pathname = usePathname();
  const isMobile = useIsMobileViewport();
  const [open, setOpen] = useState(false);
  const [draftRange, setDraftRange] = useState<DateRange | undefined>();

  const periodLabel = useMemo(
    () => formatJournalPeriodLabel({ from: filters.from, to: filters.to }),
    [filters.from, filters.to],
  );

  useEffect(() => {
    if (!open) {
      setDraftRange(undefined);
    }
  }, [open]);

  function navigateWithRange(range: JournalDateRange) {
    const nextFilters: JournalFilters = {
      ...filters,
      from: range.from,
      to: range.to,
      page: 1,
    };
    const params = buildJournalSearchParams(nextFilters, 1);
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
    setOpen(false);
  }

  const panel = (
    <JournalDateRangePanel
      filters={filters}
      draftRange={draftRange}
      onDraftRangeChange={setDraftRange}
      onApplyPreset={navigateWithRange}
      onApplyRange={navigateWithRange}
    />
  );

  if (isMobile) {
    return (
      <>
        <button
          type="button"
          aria-label="Pilih rentang tanggal"
          className={cn(JOURNAL_DATE_RANGE_TRIGGER, className)}
          onClick={() => setOpen(true)}
        >
          <span className="min-w-0 truncate capitalize">{periodLabel}</span>
          <CalendarBlankIcon className="size-4 shrink-0 text-muted-foreground" />
        </button>
        <Drawer open={open} onOpenChange={setOpen}>
          <DrawerContent className="px-4 pb-[calc(var(--mobile-safe-bottom)+1rem)]">
            <DrawerHeader className="px-0 text-left">
              <DrawerTitle className="text-base font-semibold">
                Rentang waktu
              </DrawerTitle>
            </DrawerHeader>
            {panel}
          </DrawerContent>
        </Drawer>
      </>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        type="button"
        aria-label="Pilih rentang tanggal"
        className={cn(JOURNAL_DATE_RANGE_TRIGGER, className)}
      >
        <span className="min-w-0 truncate capitalize">{periodLabel}</span>
        <CalendarBlankIcon className="size-4 shrink-0 text-muted-foreground" />
      </PopoverTrigger>
      <PopoverContent className="w-auto p-3" align="end">
        {panel}
      </PopoverContent>
    </Popover>
  );
}
