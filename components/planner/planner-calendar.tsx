"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { PlannerCalendarDay } from "@/components/planner/planner-calendar-day";
import { PlannerCalendarDayDialog } from "@/components/planner/planner-calendar-day-dialog";
import { PlannerCalendarHeader } from "@/components/planner/planner-calendar-header";
import { PlannerCalendarSummary } from "@/components/planner/planner-calendar-summary";
import { PlannerCalendarUpcoming } from "@/components/planner/planner-calendar-upcoming";
import {
  PLANNER_CALENDAR_FRAME,
  PLANNER_CALENDAR_GRID,
  PLANNER_CALENDAR_WEEKDAY,
  PLANNER_CALENDAR_WEEKDAY_HEADER,
} from "@/config/planner-calendar";
import { STACK_GAP } from "@/config/spacing";
import { toDayKey } from "@/lib/finance/day-range";
import {
  getCalendarGridDays,
  getCurrentMonthKey,
  isSameMonth,
  shiftMonthKey,
  WEEKDAY_LABELS,
} from "@/lib/planner/calendar";
import { cn } from "@/lib/utils";
import type { PlannedOccurrence } from "@/types/planner";

interface PlannerCalendarProps {
  monthKey: string;
  year: number;
  month: number;
  items: Array<Omit<PlannedOccurrence, "dueAt"> & { dueAt: string }>;
  initialDayKey: string;
}

function normalizeItems(
  items: PlannerCalendarProps["items"],
): PlannedOccurrence[] {
  return items.map((item) => ({
    ...item,
    dueAt: new Date(item.dueAt),
  }));
}

export function PlannerCalendar({
  monthKey,
  year,
  month,
  items,
  initialDayKey,
}: PlannerCalendarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [selectedDayKey, setSelectedDayKey] = useState(initialDayKey);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    setSelectedDayKey(initialDayKey);
  }, [initialDayKey, monthKey]);

  const normalizedItems = useMemo(() => normalizeItems(items), [items]);

  const itemsByDay = useMemo(() => {
    const map = new Map<string, PlannedOccurrence[]>();

    for (const item of normalizedItems) {
      const dayKey = toDayKey(item.dueAt);
      const existing = map.get(dayKey);

      if (existing) {
        existing.push(item);
        continue;
      }

      map.set(dayKey, [item]);
    }

    return map;
  }, [normalizedItems]);

  const gridDays = useMemo(
    () => getCalendarGridDays(year, month),
    [year, month],
  );

  const selectedItems = useMemo(
    () => itemsByDay.get(selectedDayKey) ?? [],
    [itemsByDay, selectedDayKey],
  );

  const selectedTotal = useMemo(
    () =>
      selectedItems.reduce(
        (total, item) =>
          item.type === "income" ? total - item.amount : total + item.amount,
        0,
      ),
    [selectedItems],
  );

  const selectedDate = useMemo(() => {
    const item = normalizedItems.find(
      (entry) => toDayKey(entry.dueAt) === selectedDayKey,
    );
    if (item) {
      return item.dueAt;
    }

    const [y, m, d] = selectedDayKey.split("-").map(Number);
    return new Date(y, m - 1, d);
  }, [normalizedItems, selectedDayKey]);

  function pushQuery(updates: Record<string, string>) {
    const params = new URLSearchParams(searchParams.toString());

    for (const [key, value] of Object.entries(updates)) {
      params.set(key, value);
    }

    router.push(`${pathname}?${params.toString()}`);
  }

  function navigateMonth(nextMonthKey: string) {
    pushQuery({ month: nextMonthKey, tab: "calendar" });
  }

  function selectDay(dayKey: string) {
    setSelectedDayKey(dayKey);
    setDialogOpen(true);
  }

  function goToToday() {
    const todayKey = toDayKey(new Date());
    navigateMonth(getCurrentMonthKey());
    selectDay(todayKey);
  }

  return (
    <div className={cn("flex flex-col", STACK_GAP)}>
      <PlannerCalendarHeader
        monthKey={monthKey}
        onPrevious={() => navigateMonth(shiftMonthKey(monthKey, -1))}
        onToday={goToToday}
        onNext={() => navigateMonth(shiftMonthKey(monthKey, 1))}
      />

      <PlannerCalendarSummary items={normalizedItems} monthKey={monthKey} />

      <section className={PLANNER_CALENDAR_FRAME}>
        <div className="grid grid-cols-7 border-b border-black/8 dark:border-white/10">
          {WEEKDAY_LABELS.map((label) => (
            <div key={label} className={PLANNER_CALENDAR_WEEKDAY_HEADER}>
              <span className={PLANNER_CALENDAR_WEEKDAY}>{label}</span>
            </div>
          ))}
        </div>

        <div className={PLANNER_CALENDAR_GRID}>
          {gridDays.map((day) => {
            const dayKey = toDayKey(day);

            return (
              <PlannerCalendarDay
                key={dayKey}
                date={day}
                inMonth={isSameMonth(day, year, month)}
                selected={dayKey === selectedDayKey}
                items={itemsByDay.get(dayKey) ?? []}
                onSelect={selectDay}
              />
            );
          })}
        </div>
      </section>

      <PlannerCalendarDayDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        date={selectedDate}
        items={selectedItems}
        totalAmount={selectedTotal}
      />

      <PlannerCalendarUpcoming
        date={selectedDate}
        items={selectedItems}
        totalAmount={selectedTotal}
      />
    </div>
  );
}
