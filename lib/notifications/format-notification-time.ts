import { startOfDay } from "@/lib/finance/day-range";

const TIME_FORMAT = new Intl.DateTimeFormat("id-ID", {
  hour: "2-digit",
  minute: "2-digit",
});

const DAY_MONTH_TIME_FORMAT = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
});

function toDate(value: Date | string): Date {
  return typeof value === "string" ? new Date(value) : value;
}

/** iOS-style relative timestamp for notification rows. */
export function formatNotificationTime(
  value: Date | string,
  referenceDate: Date = new Date(),
): string {
  const date = toDate(value);
  const now = referenceDate;
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / 60_000);

  if (diffMinutes < 1) {
    return "Baru saja";
  }

  if (diffMinutes < 60) {
    return `${diffMinutes} mnt lalu`;
  }

  const diffHours = Math.floor(diffMinutes / 60);

  if (diffHours < 24 && date.toDateString() === now.toDateString()) {
    return TIME_FORMAT.format(date);
  }

  const yesterday = startOfDay(new Date(now));
  yesterday.setDate(yesterday.getDate() - 1);

  if (startOfDay(date).getTime() === yesterday.getTime()) {
    return `Kemarin, ${TIME_FORMAT.format(date)}`;
  }

  return DAY_MONTH_TIME_FORMAT.format(date);
}
