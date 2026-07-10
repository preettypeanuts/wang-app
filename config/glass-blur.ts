import type { GlassBlurLevelId } from "@/types/glass-blur";

export const DEFAULT_GLASS_BLUR_LEVEL: GlassBlurLevelId = "normal";

/** Glass blur presets — from off to maximum. */
export const GLASS_BLUR_LEVELS: {
  id: GlassBlurLevelId;
  label: string;
  blurPx: number;
}[] = [
  { id: "off", label: "Off", blurPx: 0 },
  { id: "light", label: "Light", blurPx: 6 },
  { id: "normal", label: "Normal", blurPx: 12 },
  { id: "strong", label: "Strong", blurPx: 18 },
  { id: "max", label: "Max", blurPx: 24 },
];

export const GLASS_BLUR_LEVEL_IDS = new Set<GlassBlurLevelId>(
  GLASS_BLUR_LEVELS.map((level) => level.id),
);

export function getGlassBlurPx(levelId: GlassBlurLevelId): number {
  const level = GLASS_BLUR_LEVELS.find((item) => item.id === levelId);
  if (level) {
    return level.blurPx;
  }

  const fallback = GLASS_BLUR_LEVELS.find(
    (item) => item.id === DEFAULT_GLASS_BLUR_LEVEL,
  );
  return fallback?.blurPx ?? 12;
}
