import { describe, expect, it } from "vitest";

import {
  buildWeeklySummaryMessage,
  formatWeeklyExpenseDelta,
} from "@/lib/finance/build-weekly-summary-message";
import { getWeekRange, isMondayInAppTimezone } from "@/lib/db/weekly-summary";
import { toDayKey } from "@/lib/finance/day-range";

describe("formatWeeklyExpenseDelta", () => {
  it("reports percent up and down", () => {
    expect(formatWeeklyExpenseDelta(850_000, 758_929)).toBe(
      "naik 12% dari minggu lalu",
    );
    expect(formatWeeklyExpenseDelta(700_000, 800_000)).toBe(
      "turun 13% dari minggu lalu",
    );
  });

  it("handles missing or zero previous week", () => {
    expect(formatWeeklyExpenseDelta(100_000, null)).toBeNull();
    expect(formatWeeklyExpenseDelta(100_000, 0)).toBe(
      "baru mulai dibanding minggu lalu (Rp0)",
    );
    expect(formatWeeklyExpenseDelta(0, 0)).toBe("sama dengan minggu lalu");
  });
});

describe("buildWeeklySummaryMessage", () => {
  it("formats the Netflix-style weekly recap sample", () => {
    const message = buildWeeklySummaryMessage({
      weekStart: new Date("2026-06-30T00:00:00+07:00"),
      weekEnd: new Date("2026-07-06T23:59:59.999+07:00"),
      totalExpense: 850_000,
      totalIncome: 0,
      topCategoryId: "food",
      topCategoryAmount: 320_000,
      previousWeekExpense: 758_929,
    });

    expect(message).toBe(
      [
        "📊 Rekap minggu ini (30 Jun - 6 Jul)",
        "Total keluar: Rp850.000 (naik 12% dari minggu lalu)",
        "Kategori terbesar: Makanan & Minum (Rp320.000)",
        "Pemasukan: Rp0",
      ].join("\n"),
    );
  });
});

describe("getWeekRange", () => {
  it("returns Monday–Sunday for a midweek date", () => {
    const range = getWeekRange(new Date("2026-07-08T10:00:00+07:00"));
    expect(toDayKey(range.weekStartDay)).toBe("2026-07-06");
    expect(toDayKey(range.end)).toBe("2026-07-12");
    expect(isMondayInAppTimezone(new Date("2026-07-06T08:00:00+07:00"))).toBe(
      true,
    );
    expect(isMondayInAppTimezone(new Date("2026-07-08T08:00:00+07:00"))).toBe(
      false,
    );
  });
});
