import type { WallpaperMaskColor } from "@/types/wallpaper";

export const WALLPAPER_MASK_MIN = 0;
export const WALLPAPER_MASK_MAX = 80;
export const WALLPAPER_MASK_STEP = 5;
export const DEFAULT_WALLPAPER_MASK = 0;

export const WALLPAPER_MASK_COLORS: {
  id: WallpaperMaskColor;
  label: string;
  swatchClassName: string;
}[] = [
  { id: "black", label: "Hitam", swatchClassName: "bg-black" },
  {
    id: "white",
    label: "Putih",
    swatchClassName: "bg-white ring-1 ring-inset ring-black/10",
  },
];

export const WALLPAPER_MASK_COLOR_IDS = new Set<WallpaperMaskColor>(
  WALLPAPER_MASK_COLORS.map((color) => color.id),
);
