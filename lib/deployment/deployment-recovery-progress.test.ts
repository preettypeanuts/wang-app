import { describe, expect, it } from "vitest";

import {
  getRecoveryProgress,
  getRecoverySecondsRemaining,
  getRecoveryStageLabel,
} from "@/lib/deployment/deployment-recovery-progress";

describe("deployment recovery progress", () => {
  it("maps elapsed time to progress", () => {
    const startedAt = 0;
    expect(getRecoveryProgress(startedAt, 2500)).toBe(50);
  });

  it("counts down remaining seconds", () => {
    const startedAt = 0;
    expect(getRecoverySecondsRemaining(startedAt, 1000)).toBe(4);
    expect(getRecoverySecondsRemaining(startedAt, 5000)).toBe(0);
  });

  it("returns stage labels by progress", () => {
    expect(getRecoveryStageLabel(10)).toContain("cache");
    expect(getRecoveryStageLabel(50)).toContain("versi terbaru");
    expect(getRecoveryStageLabel(90)).toContain("Menyiapkan");
  });
});
