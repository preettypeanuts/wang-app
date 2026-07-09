import { describe, expect, it } from "vitest";

import { DAILY_DIGEST_HOUR_WIB } from "@/config/notifications";
import {
  addDays,
  getHourInAppTimezone,
  startOfDay,
  toDayKey,
} from "@/lib/finance/day-range";

describe("daily digest scheduling", () => {
  it("maps 05:00 WIB to hour 5 in app timezone", () => {
    const digestTime = new Date("2026-07-10T05:00:00+07:00");
    expect(getHourInAppTimezone(digestTime)).toBe(DAILY_DIGEST_HOUR_WIB);
  });

  it("treats midnight WIB as the previous digest day boundary", () => {
    const midnight = new Date("2026-07-10T00:02:00+07:00");
    const yesterday = addDays(startOfDay(midnight), -1);

    expect(toDayKey(yesterday)).toBe("2026-07-09");
    expect(getHourInAppTimezone(midnight)).toBe(0);
  });
});
