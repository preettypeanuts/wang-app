"use client";

import { PlannerCalendarUpcomingItem } from "@/components/planner/planner-calendar-upcoming-item";
import {
  PLANNER_CALENDAR_UPCOMING_EMPTY,
  PLANNER_CALENDAR_UPCOMING_FRAME,
  PLANNER_CALENDAR_UPCOMING_HEADER,
  PLANNER_CALENDAR_UPCOMING_LIST,
} from "@/config/planner-calendar";
import { formatDayMonth, formatWeekday } from "@/lib/finance/format-datetime";
import { formatIdr } from "@/lib/finance/format-currency";
import { isPastDay } from "@/lib/planner/calendar";
import type { PlannedOccurrence } from "@/types/planner";

interface PlannerCalendarUpcomingProps {
  date: Date;
  items: PlannedOccurrence[];
  totalAmount: number;
}

export function PlannerCalendarUpcoming({
  date,
  items,
  totalAmount,
}: PlannerCalendarUpcomingProps) {
  const hasItems = items.length > 0;
  const isPast = isPastDay(date);

  return (
    <section className={PLANNER_CALENDAR_UPCOMING_FRAME}>
      <header className={PLANNER_CALENDAR_UPCOMING_HEADER}>
        <div className="min-w-0">
          <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
            Jadwal terpilih
          </p>
          <h3 className="mt-0.5 truncate text-sm font-semibold capitalize">
            {formatWeekday(date)}, {formatDayMonth(date)}
          </h3>
        </div>
        {hasItems ? (
          <div className="shrink-0 text-right">
            <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
              Total
            </p>
            <p className="mt-0.5 text-sm font-semibold tabular-nums text-foreground/90">
              {formatIdr(Math.abs(totalAmount))}
              {totalAmount > 0
                ? " keluar"
                : totalAmount < 0
                  ? " masuk"
                  : ""}
            </p>
          </div>
        ) : null}
      </header>

      {hasItems ? (
        <div className={PLANNER_CALENDAR_UPCOMING_LIST}>
          {items.map((item) => (
            <PlannerCalendarUpcomingItem key={item.id} item={item} />
          ))}
        </div>
      ) : (
        <div className={PLANNER_CALENDAR_UPCOMING_EMPTY}>
          <p className="text-sm font-medium">Tidak ada tagihan</p>
          <p className="mt-1 max-w-xs text-xs text-muted-foreground">
            {isPast
              ? "Hari ini sudah lewat — pilih tanggal lain yang punya jadwal."
              : "Belum ada transaksi terjadwal di tanggal ini."}
          </p>
        </div>
      )}
    </section>
  );
}
