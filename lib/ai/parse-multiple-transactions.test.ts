import { describe, expect, it, vi } from "vitest";

import {
  parseMultipleTransactionsLocally,
  splitTransactionSegments,
} from "@/lib/ai/parse-multiple-transactions";

describe("splitTransactionSegments", () => {
  it("splits comma-separated expenses", () => {
    expect(
      splitTransactionSegments("parkir 5rb, kopi 20rb, makan siang 35rb"),
    ).toEqual(["parkir 5rb", "kopi 20rb", "makan siang 35rb"]);
  });
});

describe("parseMultipleTransactionsLocally", () => {
  it("parses three expense segments", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-07-08T10:00:00+07:00"));

    const result = await parseMultipleTransactionsLocally(
      "parkir 5rb, kopi 20rb, makan siang 35rb",
    );

    expect(result).toHaveLength(3);
    expect(result.map((item) => item.amount)).toEqual([5_000, 20_000, 35_000]);
    expect(result.reduce((sum, item) => sum + item.amount, 0)).toBe(60_000);

    vi.useRealTimers();
  });

  it("keeps single messages as one transaction", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-07-08T10:00:00+07:00"));

    const result = await parseMultipleTransactionsLocally("makan siang 25rb");

    expect(result).toHaveLength(1);
    expect(result[0].amount).toBe(25_000);

    vi.useRealTimers();
  });
});
