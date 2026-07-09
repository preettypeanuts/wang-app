import {
  APP_TIMEZONE,
  APP_TIMEZONE_OFFSET,
} from "@/config/timezone";

const DAY_KEY_FORMAT = new Intl.DateTimeFormat("en-CA", {
  timeZone: APP_TIMEZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

function isValidDayKey(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

/** Start of calendar day in app timezone (WIB). */
export function startOfDay(value: Date = new Date()): Date {
  const dayKey = toDayKey(value);
  return new Date(`${dayKey}T00:00:00${APP_TIMEZONE_OFFSET}`);
}

/** End of calendar day in app timezone (WIB). */
export function endOfDay(value: Date = new Date()): Date {
  const dayKey = toDayKey(value);
  return new Date(`${dayKey}T23:59:59.999${APP_TIMEZONE_OFFSET}`);
}

export function getDayRange(value: Date = new Date()) {
  const start = startOfDay(value);
  const end = endOfDay(value);

  return { start, end };
}

export function addDays(value: Date, days: number): Date {
  const next = new Date(value);
  next.setDate(next.getDate() + days);
  return next;
}

/** YYYY-MM-DD for a calendar Date in app timezone (WIB). */
export function dateInputFromCalendarDate(date: Date): string {
  return toDayKey(date);
}

/** Parse YYYY-MM-DD to noon WIB — stable for storage and display. */
export function parseDateOnlyInput(value: string): Date | null {
  if (!isValidDayKey(value)) {
    return null;
  }

  const date = parseDayKey(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date;
}

/** YYYY-MM-DD in app timezone (WIB). */
export function toDayKey(value: Date | string): string {
  const date = typeof value === "string" ? new Date(value) : value;
  return DAY_KEY_FORMAT.format(date);
}

/** Parse YYYY-MM-DD to noon WIB. */
export function parseDayKey(dayKey: string): Date {
  if (!isValidDayKey(dayKey)) {
    return new Date(Number.NaN);
  }

  return new Date(`${dayKey}T12:00:00${APP_TIMEZONE_OFFSET}`);
}

/** Today's calendar day as YYYY-MM-DD in app timezone (WIB). */
export function todayDateInputValue(): string {
  return toDayKey(new Date());
}

export function getDateOnlyParts(value: Date) {
  const dayKey = toDayKey(value);
  const [year, month, day] = dayKey.split("-").map(Number);

  return {
    year,
    month: month - 1,
    day,
  };
}

/** Noon WIB for a calendar day — stable for date-only storage and comparisons. */
export function dateOnlyFromParts(
  year: number,
  month: number,
  day: number,
): Date {
  const dayKey = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  return parseDayKey(dayKey);
}

export function clampDateOnlyDay(
  year: number,
  month: number,
  day: number,
): Date {
  const lastDay = new Date(
    Date.UTC(year, month + 1, 0, 12, 0, 0, 0),
  ).getUTCDate();
  return dateOnlyFromParts(year, month, Math.min(day, lastDay));
}

export function getYesterday(referenceDate: Date = new Date()): Date {
  return addDays(startOfDay(referenceDate), -1);
}

export function getHourInAppTimezone(value: Date = new Date()): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: APP_TIMEZONE,
    hour: "numeric",
    hour12: false,
  }).formatToParts(value);

  const hour = parts.find((part) => part.type === "hour")?.value;
  return Number(hour ?? 0);
}
