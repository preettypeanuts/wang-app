import type { AccentColorId } from "@/types/appearance";

export interface AccentColorOption {
  id: AccentColorId;
  label: string;
  swatch: string;
}

export const DEFAULT_ACCENT_ID: AccentColorId = "blue";

/** Maps removed accent ids from older app versions. */
const LEGACY_ACCENT_IDS: Record<string, AccentColorId> = {
  neutral: "graphite",
  coral: "red",
};

export const ACCENT_COLORS: AccentColorOption[] = [
  { id: "blue", label: "Biru", swatch: "#0A84FF" },
  { id: "purple", label: "Ungu", swatch: "#BF5AF2" },
  { id: "pink", label: "Pink", swatch: "#FF2D55" },
  { id: "red", label: "Merah", swatch: "#FF3B30" },
  { id: "orange", label: "Oranye", swatch: "#FF9F0A" },
  { id: "yellow", label: "Kuning", swatch: "#FFD60A" },
  { id: "green", label: "Hijau", swatch: "#30D158" },
  { id: "graphite", label: "Grafite", swatch: "#8E8E93" },
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
