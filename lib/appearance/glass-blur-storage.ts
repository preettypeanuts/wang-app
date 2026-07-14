import {
  DEFAULT_GLASS_BLUR_LEVEL,
  GLASS_BLUR_LEVEL_IDS,
} from "@/config/glass-blur";
import {
  clampGlassFillTransparency,
  DEFAULT_GLASS_FILL_TRANSPARENCY,
} from "@/config/glass-fill";
import type { GlassBlurLevelId } from "@/types/glass-blur";

const BLUR_STORAGE_KEY = "wang:glass-blur";
const FILL_TRANSPARENCY_STORAGE_KEY = "wang:glass-fill-transparency";
const LEGACY_OFF_FILL_STORAGE_KEY = "wang:glass-off-fill";

export function readStoredGlassBlurLevel(): GlassBlurLevelId {
  if (typeof window === "undefined") {
    return DEFAULT_GLASS_BLUR_LEVEL;
  }

  const stored = window.localStorage.getItem(BLUR_STORAGE_KEY);
  if (!stored || !GLASS_BLUR_LEVEL_IDS.has(stored as GlassBlurLevelId)) {
    return DEFAULT_GLASS_BLUR_LEVEL;
  }

  return stored as GlassBlurLevelId;
}

export function writeStoredGlassBlurLevel(levelId: GlassBlurLevelId): void {
  window.localStorage.setItem(BLUR_STORAGE_KEY, levelId);
}

function readLegacyGlassFillTransparency(): number | null {
  const stored = window.localStorage.getItem(LEGACY_OFF_FILL_STORAGE_KEY);
  if (stored === "transparent") {
    return 70;
  }
  if (stored === "solid") {
    return 10;
  }
  return null;
}

export function readStoredGlassFillTransparency(): number {
  if (typeof window === "undefined") {
    return DEFAULT_GLASS_FILL_TRANSPARENCY;
  }

  const stored = window.localStorage.getItem(FILL_TRANSPARENCY_STORAGE_KEY);
  if (stored) {
    const parsed = Number.parseInt(stored, 10);
    if (!Number.isNaN(parsed)) {
      return clampGlassFillTransparency(parsed);
    }
  }

  const legacy = readLegacyGlassFillTransparency();
  if (legacy !== null) {
    return clampGlassFillTransparency(legacy);
  }

  return DEFAULT_GLASS_FILL_TRANSPARENCY;
}

export function writeStoredGlassFillTransparency(value: number): void {
  window.localStorage.setItem(
    FILL_TRANSPARENCY_STORAGE_KEY,
    String(clampGlassFillTransparency(value)),
  );
}
