import { describe, expect, it } from "vitest";
import { toDayKey } from "@/lib/finance/day-range";
import {
  formatTransactionOccurredAtHint,
  parseRelativeDate,
} from "@/lib/finance/parse-relative-date";

const NOW = new Date("2026-07-08T15:30:00+07:00");

function expectParsedDate(text: string, now: Date = NOW) {
  const result = parseRelativeDate(text, now);
  if (!result) {
    throw new Error(`Expected date parse for: ${text}`);
  }
  return result;
}

describe("parseRelativeDate", () => {
  it("parses kemarin and strips the phrase", () => {
    const result = expectParsedDate("kemarin beli baju 200rb");

    expect(result.cleanedText).toBe("beli baju 200rb");
    expect(toDayKey(result.occurredAt)).toBe("2026-07-07");
  });

  it("parses N hari lalu", () => {
    const result = expectParsedDate("3 hari lalu bayar parkir 10rb");

    expect(result.cleanedText).toBe("bayar parkir 10rb");
    expect(toDayKey(result.occurredAt)).toBe("2026-07-05");
  });

  it("returns null when no date phrase is present", () => {
    expect(parseRelativeDate("makan siang 25rb", NOW)).toBeNull();
  });

  it("parses kemarin lusa as two days ago", () => {
    const result = expectParsedDate("kemarin lusa ojol 20rb");

    expect(result.cleanedText).toBe("ojol 20rb");
    expect(toDayKey(result.occurredAt)).toBe("2026-07-06");
  });

  it("parses minggu lalu", () => {
    const result = expectParsedDate("minggu lalu belanja 100rb");

    expect(toDayKey(result.occurredAt)).toBe("2026-07-01");
  });

  it("parses explicit DD/MM in the past", () => {
    const result = expectParsedDate("makan 05/07 50rb");

    expect(result.cleanedText).toBe("makan 50rb");
    expect(toDayKey(result.occurredAt)).toBe("2026-07-05");
  });

  it("rolls future explicit day to previous month", () => {
    const result = expectParsedDate("tanggal 15 beli kopi 30rb");

    expect(toDayKey(result.occurredAt)).toBe("2026-06-15");
  });
});

describe("formatTransactionOccurredAtHint", () => {
  it("returns kemarin hint for yesterday", () => {
    const hint = formatTransactionOccurredAtHint(
      "2026-07-07T12:00:00+07:00",
      NOW,
    );

    expect(hint).toMatch(/^\(kemarin, /);
    expect(hint).toContain("Juli");
  });

  it("returns null for today", () => {
    expect(
      formatTransactionOccurredAtHint("2026-07-08T12:00:00+07:00", NOW),
    ).toBeNull();
  });
});
