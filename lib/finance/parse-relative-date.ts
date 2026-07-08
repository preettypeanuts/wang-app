import { subDays, subMonths } from "date-fns";

import {
  dateOnlyFromParts,
  getDateOnlyParts,
  toDayKey,
} from "@/lib/finance/day-range";
import { formatDayMonth } from "@/lib/finance/format-datetime";

const INDONESIAN_NUMBER_WORDS: Record<string, number> = {
  satu: 1,
  dua: 2,
  tiga: 3,
  empat: 4,
  lima: 5,
  enam: 6,
  tujuh: 7,
};

interface RelativeDatePattern {
  regex: RegExp;
  resolve: (match: RegExpMatchArray, now: Date) => Date;
}

function parseIndonesianNumber(token: string): number {
  const normalized = token.toLowerCase();
  return INDONESIAN_NUMBER_WORDS[normalized] ?? Number.parseInt(token, 10);
}

function stripMatch(text: string, match: RegExpMatchArray): string {
  const start = match.index ?? 0;
  const end = start + match[0].length;

  return `${text.slice(0, start)} ${text.slice(end)}`
    .replace(/\s+/g, " ")
    .trim();
}

function resolveExplicitCalendarDate(
  day: number,
  month: number | null,
  now: Date,
): Date {
  const { year, month: currentMonth } = getDateOnlyParts(now);
  const targetMonth = month !== null ? month - 1 : currentMonth;

  let candidate = dateOnlyFromParts(year, targetMonth, day);
  const todayKey = toDayKey(now);

  if (toDayKey(candidate) > todayKey) {
    candidate = subMonths(candidate, 1);
  }

  return candidate;
}

const RELATIVE_DATE_PATTERNS: RelativeDatePattern[] = [
  {
    regex: /\b(kemarin|kemaren)\s+lusa\b/i,
    resolve: (_, now) => subDays(now, 2),
  },
  {
    regex:
      /\b(\d+|satu|dua|tiga|empat|lima|enam|tujuh)\s+hari\s+(?:yang\s+)?lalu\b/i,
    resolve: (match, now) => {
      const days = parseIndonesianNumber(match[1]);
      return subDays(now, days);
    },
  },
  {
    regex: /\b(kemarin|kemaren)\b/i,
    resolve: (_, now) => subDays(now, 1),
  },
  {
    regex: /\b(?:se)?minggu\s+lalu\b/i,
    resolve: (_, now) => subDays(now, 7),
  },
  {
    regex: /\b(?:hari\s+ini|tadi|barusan)\b/i,
    resolve: (_, now) => now,
  },
  {
    regex: /\btanggal\s+(\d{1,2})\b/i,
    resolve: (match, now) =>
      resolveExplicitCalendarDate(Number.parseInt(match[1], 10), null, now),
  },
  {
    regex: /\b(\d{1,2})[/-](\d{1,2})\b/,
    resolve: (match, now) =>
      resolveExplicitCalendarDate(
        Number.parseInt(match[1], 10),
        Number.parseInt(match[2], 10),
        now,
      ),
  },
];

/**
 * Detect Indonesian relative/explicit date phrases in chat text.
 * Returns parsed date + text with the date phrase removed, or null if none matched.
 */
export function parseRelativeDate(
  text: string,
  now: Date,
): { occurredAt: Date; cleanedText: string } | null {
  const trimmed = text.trim();
  if (!trimmed) {
    return null;
  }

  for (const { regex, resolve } of RELATIVE_DATE_PATTERNS) {
    const match = trimmed.match(regex);
    if (!match) {
      continue;
    }

    const occurredAt = resolve(match, now);
    if (Number.isNaN(occurredAt.getTime())) {
      continue;
    }

    // Guard invalid explicit day/month combinations from date-fns overflow.
    if (regex.source.includes("tanggal") || regex.source.includes("[/-]")) {
      const requestedDay = Number.parseInt(match[1], 10);
      const { day } = getDateOnlyParts(occurredAt);
      if (day !== requestedDay) {
        continue;
      }
    }

    const cleanedText = stripMatch(trimmed, match);
    return { occurredAt, cleanedText };
  }

  return null;
}

/** True when occurredAt falls on a different calendar day than reference (WIB). */
export function isOccurredAtPastDay(
  occurredAt: Date,
  reference: Date = new Date(),
): boolean {
  return toDayKey(occurredAt) !== toDayKey(reference);
}

/** Reply hint e.g. "(kemarin, 6 Juli)" — null when transaction is today. */
export function formatTransactionOccurredAtHint(
  occurredAt: string | Date,
  referenceDate: Date = new Date(),
): string | null {
  const date =
    typeof occurredAt === "string" ? new Date(occurredAt) : occurredAt;

  if (!isOccurredAtPastDay(date, referenceDate)) {
    return null;
  }

  const dayMonth = formatDayMonth(date);
  const referenceYesterday = toDayKey(subDays(referenceDate, 1));

  if (toDayKey(date) === referenceYesterday) {
    return `(kemarin, ${dayMonth})`;
  }

  return `(${dayMonth})`;
}
