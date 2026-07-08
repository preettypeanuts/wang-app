import {
  addDays,
  endOfDay,
  parseDayKey,
  startOfDay,
  toDayKey,
} from "@/lib/finance/day-range";

const MONTH_YEAR_FORMAT = new Intl.DateTimeFormat("id-ID", {
  month: "long",
  year: "numeric",
});

const MONTH_SHORT_FORMAT = new Intl.DateTimeFormat("id-ID", {
  month: "short",
});

const WEEKDAY_LABELS = [
  "Min",
  "Sen",
  "Sel",
  "Rab",
  "Kam",
  "Jum",
  "Sab",
] as const;

const WEEKDAY_INITIALS = WEEKDAY_LABELS.map((label) => label.charAt(0));

export { WEEKDAY_INITIALS, WEEKDAY_LABELS };

export function toMonthKey(year: number, month: number): string {
  return `${year}-${String(month + 1).padStart(2, "0")}`;
}

export function parseMonthKey(
  monthKey: string,
): { year: number; month: number } | null {
  const match = /^(\d{4})-(\d{2})$/.exec(monthKey);
  if (!match) {
    return null;
  }

  const year = Number(match[1]);
  const month = Number(match[2]) - 1;

  if (!Number.isFinite(year) || month < 0 || month > 11) {
    return null;
  }

  return { year, month };
}

export function getCurrentMonthKey(date: Date = new Date()): string {
  return toDayKey(date).slice(0, 7);
}

export function getMonthRange(year: number, month: number) {
  const start = startOfDay(new Date(year, month, 1));
  const end = endOfDay(new Date(year, month + 1, 0));

  return { start, end };
}

export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

export function shiftMonthKey(monthKey: string, delta: number): string {
  const parsed = parseMonthKey(monthKey) ?? {
    year: new Date().getFullYear(),
    month: new Date().getMonth(),
  };

  const date = new Date(parsed.year, parsed.month + delta, 1);
  return toMonthKey(date.getFullYear(), date.getMonth());
}

export function formatPlannerMonthLabel(monthKey: string): string {
  const parsed = parseMonthKey(monthKey);
  if (!parsed) {
    return MONTH_YEAR_FORMAT.format(new Date());
  }

  return MONTH_YEAR_FORMAT.format(new Date(parsed.year, parsed.month, 1));
}

/** Month-only title for Apple-style mobile calendar (e.g. "Juli"). */
export function formatAppleMonthTitle(monthKey: string): string {
  const parsed = parseMonthKey(monthKey);
  const date = parsed ? new Date(parsed.year, parsed.month, 1) : new Date();
  const label = new Intl.DateTimeFormat("id-ID", { month: "long" }).format(
    date,
  );

  return label.charAt(0).toUpperCase() + label.slice(1);
}

/** Sunday-start calendar grid (42 days) for the given month. */
export function getCalendarGridDays(year: number, month: number): Date[] {
  const firstOfMonth = new Date(year, month, 1);
  const sundayOffset = firstOfMonth.getDay();
  const gridStart = addDays(firstOfMonth, -sundayOffset);

  return Array.from({ length: 42 }, (_, index) => addDays(gridStart, index));
}

export function formatCalendarCellDayLabel(
  date: Date,
  inMonth: boolean,
): string {
  if (!inMonth && date.getDate() === 1) {
    const monthShort = MONTH_SHORT_FORMAT.format(date);
    return `${date.getDate()} ${monthShort}`;
  }

  return String(date.getDate());
}

export function isSameMonth(date: Date, year: number, month: number): boolean {
  return date.getFullYear() === year && date.getMonth() === month;
}

export function isToday(date: Date): boolean {
  return toDayKey(date) === toDayKey(new Date());
}

export function isPastDay(date: Date): boolean {
  return startOfDay(date).getTime() < startOfDay(new Date()).getTime();
}

export function pickDefaultDayKey(
  monthKey: string,
  marks: { dayKey: string }[],
): string {
  const todayKey = toDayKey(new Date());
  const parsed = parseMonthKey(monthKey);

  if (parsed && todayKey.startsWith(`${monthKey}-`)) {
    return todayKey;
  }

  if (marks.length > 0) {
    return marks[0].dayKey;
  }

  if (parsed) {
    return toDayKey(parseDayKey(`${monthKey}-01`));
  }

  return todayKey;
}
