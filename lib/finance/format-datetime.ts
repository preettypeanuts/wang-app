import { addDays, parseDayKey, toDayKey } from "@/lib/finance/day-range";
import { APP_TIMEZONE } from "@/config/timezone";

const WEEKDAY_FORMAT = new Intl.DateTimeFormat("id-ID", {
  weekday: "long",
  timeZone: APP_TIMEZONE,
});

const DAY_MONTH_FORMAT = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "long",
  timeZone: APP_TIMEZONE,
});

const DATE_FORMAT = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: APP_TIMEZONE,
});

const TIME_FORMAT = new Intl.DateTimeFormat("id-ID", {
  hour: "2-digit",
  minute: "2-digit",
  timeZone: APP_TIMEZONE,
});

const DATE_TIME_FORMAT = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: APP_TIMEZONE,
});

function toDate(value: Date | string): Date {
  return typeof value === "string" ? new Date(value) : value;
}

export function formatDateTime(value: Date | string): string {
  return DATE_TIME_FORMAT.format(toDate(value));
}

export function formatJournalDate(value: Date | string): string {
  return DATE_FORMAT.format(toDate(value));
}

export function formatJournalTime(value: Date | string): string {
  return TIME_FORMAT.format(toDate(value));
}

export function formatWeekday(value: Date | string = new Date()): string {
  return WEEKDAY_FORMAT.format(toDate(value));
}

export function formatDayMonth(value: Date | string = new Date()): string {
  return DAY_MONTH_FORMAT.format(toDate(value));
}

const FULL_PAYOFF_DATE_FORMAT = new Intl.DateTimeFormat("id-ID", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: APP_TIMEZONE,
});

/** Full payoff date e.g. "Sabtu, 5 Juli 2026" — returns null if invalid. */
export function formatFullPayoffDate(
  value: Date | string | null | undefined,
): string | null {
  if (!value) {
    return null;
  }

  const date =
    typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)
      ? parseDayKey(value)
      : parseDayKey(toDayKey(value));
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return FULL_PAYOFF_DATE_FORMAT.format(date);
}

const COMPACT_DAY_MONTH_FORMAT = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "short",
  timeZone: APP_TIMEZONE,
});

export function formatCompactDayMonth(
  value: Date | string = new Date(),
): string {
  return COMPACT_DAY_MONTH_FORMAT.format(toDate(value));
}

export function formatJournalHeaderDate(
  value: Date | string = new Date(),
): string {
  return `${formatWeekday(value)}, ${formatDayMonth(value)}`;
}

export function formatJournalSectionDate(
  value: Date | string,
  referenceDate: Date = new Date(),
): string {
  const dateKey = toDayKey(value);
  const todayKey = toDayKey(referenceDate);

  if (dateKey === todayKey) {
    return "Hari ini";
  }

  if (dateKey === toDayKey(addDays(referenceDate, -1))) {
    return "Kemarin";
  }

  return formatJournalDate(value);
}

export function formatChatTimestamp(value: Date | string): string {
  const date = toDate(value);
  const isToday = toDayKey(date) === toDayKey(new Date());

  if (isToday) {
    return formatJournalTime(date);
  }

  return `${formatJournalDate(date)} · ${formatJournalTime(date)}`;
}
