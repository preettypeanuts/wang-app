import { describe, expect, it, vi } from "vitest";

import { parseTransactionLocally } from "@/lib/ai/parse-transaction";
import { toDayKey } from "@/lib/finance/day-range";

describe("parseTransactionLocally", () => {
  it("uses yesterday for kemarin messages", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-07-08T10:00:00+07:00"));

    const result = await parseTransactionLocally("kemarin beli baju 200rb");

    expect(result.description).toBe("beli baju 200rb");
    expect(result.amount).toBe(200_000);
    expect(toDayKey(result.occurredAt)).toBe("2026-07-07");

    vi.useRealTimers();
  });

  it("uses three days ago for 3 hari lalu messages", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-07-08T10:00:00+07:00"));

    const result = await parseTransactionLocally("3 hari lalu bayar parkir 10rb");

    expect(result.description).toBe("bayar parkir 10rb");
    expect(result.amount).toBe(10_000);
    expect(toDayKey(result.occurredAt)).toBe("2026-07-05");

    vi.useRealTimers();
  });

  it("defaults to today when no date phrase is mentioned", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-07-08T10:00:00+07:00"));

    const result = await parseTransactionLocally("makan siang 25rb");

    expect(result.description).toBe("makan siang 25rb");
    expect(result.amount).toBe(25_000);
    expect(toDayKey(result.occurredAt)).toBe("2026-07-08");

    vi.useRealTimers();
  });
});
