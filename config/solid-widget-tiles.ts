/** Solid iOS-style widget tiles — subtle same-hue gradients, no glass blur. */
const TILE_HIGHLIGHT =
  "shadow-[inset_0_1px_0_0_rgba(255,255,255,0.28),0_1px_2px_rgba(0,0,0,0.06)] dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.12),0_1px_3px_rgba(0,0,0,0.35)]";

export interface SolidWidgetTileStyle {
  surface: string;
  iconColor: string;
  labelColor: string;
  valueColor: string;
  subtitleColor: string;
}

export const SOLID_WIDGET_TILE_STYLES = {
  expense: {
    surface: `bg-linear-to-br from-[#FF8585] to-[#FF6B6B] dark:from-[#FF7070] dark:to-[#E85555] ${TILE_HIGHLIGHT}`,
    iconColor: "text-white/95",
    labelColor: "text-white/85",
    valueColor: "text-white",
    subtitleColor: "text-white/70",
  },
  income: {
    surface: `bg-linear-to-br from-[#4CD964] to-[#34C759] dark:from-[#3ECF5A] dark:to-[#2FAE52] ${TILE_HIGHLIGHT}`,
    iconColor: "text-white/95",
    labelColor: "text-white/85",
    valueColor: "text-white",
    subtitleColor: "text-white/70",
  },
  balance: {
    surface: `bg-linear-to-br from-[#A578FF] to-[#8E5AF7] dark:from-[#9B6AF0] dark:to-[#7A4AD9] ${TILE_HIGHLIGHT}`,
    iconColor: "text-white/95",
    labelColor: "text-white/85",
    valueColor: "text-white",
    subtitleColor: "text-white/70",
  },
  condition: {
    surface: `bg-linear-to-br from-[#FFE066] to-[#FFD60A] dark:from-[#E6C84A] dark:to-[#C9A800] ${TILE_HIGHLIGHT}`,
    iconColor: "text-[#5C4A00] dark:text-[#FFF4CC]",
    labelColor: "text-[#5C4A00]/90 dark:text-white/85",
    valueColor: "text-[#3D3100] dark:text-white",
    subtitleColor: "text-[#5C4A00]/75 dark:text-white/70",
  },
} as const satisfies Record<string, SolidWidgetTileStyle>;
