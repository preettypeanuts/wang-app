import type { AccentColorId } from "@/types/appearance";

export interface AccentColorOption {
  id: AccentColorId;
  label: string;
  /** Apple system color — light mode (slightly deeper). */
  light: string;
  /** Apple system color — dark mode (slightly brighter). */
  dark: string;
}

export const DEFAULT_ACCENT_ID: AccentColorId = "blue";

/** Maps removed accent ids from older app versions. */
const LEGACY_ACCENT_IDS: Record<string, AccentColorId> = {
  neutral: "graphite",
  coral: "red",
};

/**
 * Apple HIG system colors.
 * Light: richer/deeper · Dark: brighter for contrast on dark surfaces.
 */
export const ACCENT_COLORS: AccentColorOption[] = [
  { id: "blue", label: "Blue", light: "#007AFF", dark: "#0A84FF" },
  { id: "purple", label: "Purple", light: "#AF52DE", dark: "#BF5AF2" },
  { id: "pink", label: "Pink", light: "#FF2D55", dark: "#FF375F" },
  { id: "red", label: "Red", light: "#FF3B30", dark: "#FF453A" },
  { id: "orange", label: "Orange", light: "#FF9500", dark: "#FF9F0A" },
  { id: "yellow", label: "Yellow", light: "#FFCC00", dark: "#FFD60A" },
  { id: "green", label: "Green", light: "#34C759", dark: "#30D158" },
  { id: "graphite", label: "Graphite", light: "#8E8E93", dark: "#98989D" },
];

export const ACCENT_COLOR_IDS = new Set<AccentColorId>(
  ACCENT_COLORS.map((accent) => accent.id),
);

export function normalizeAccentId(value: string): AccentColorId {
  if (ACCENT_COLOR_IDS.has(value as AccentColorId)) {
    return value as AccentColorId;
  }

  return LEGACY_ACCENT_IDS[value] ?? DEFAULT_ACCENT_ID;
}

export function getAccentSwatch(
  accentId: AccentColorId,
  isDark: boolean,
): string {
  const accent =
    ACCENT_COLORS.find((entry) => entry.id === accentId) ?? ACCENT_COLORS[0];

  return isDark ? accent.dark : accent.light;
}
