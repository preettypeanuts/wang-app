/** Start of calendar day in local time. */
export function startOfDay(value: Date = new Date()): Date {
  return new Date(value.getFullYear(), value.getMonth(), value.getDate());
}

/** End of calendar day in local time. */
export function endOfDay(value: Date = new Date()): Date {
  return new Date(
    value.getFullYear(),
    value.getMonth(),
    value.getDate(),
    23,
    59,
    59,
    999,
  );
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

export function toDayKey(value: Date): string {
  const date = startOfDay(value);
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}

export function parseDayKey(dayKey: string): Date {
  const [year, month, day] = dayKey.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export function getYesterday(): Date {
  return addDays(startOfDay(new Date()), -1);
}
