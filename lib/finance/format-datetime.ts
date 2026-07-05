const WEEKDAY_FORMAT = new Intl.DateTimeFormat("id-ID", {
  weekday: "long",
});

const DAY_MONTH_FORMAT = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "long",
});

const DATE_FORMAT = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

const TIME_FORMAT = new Intl.DateTimeFormat("id-ID", {
  hour: "2-digit",
  minute: "2-digit",
});

const DATE_TIME_FORMAT = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
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

export function formatJournalHeaderDate(
  value: Date | string = new Date(),
): string {
  return `${formatWeekday(value)}, ${formatDayMonth(value)}`;
}

export function formatChatTimestamp(value: Date | string): string {
  const date = toDate(value);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();

  if (isToday) {
    return formatJournalTime(date);
  }

  return `${formatJournalDate(date)} · ${formatJournalTime(date)}`;
}
