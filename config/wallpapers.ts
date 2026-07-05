import type { Wallpaper, WallpaperId } from "@/types/wallpaper";

export const DEFAULT_WALLPAPER_ID: WallpaperId = "default";
export const CUSTOM_WALLPAPER_ID: WallpaperId = "custom";

export const WALLPAPERS: Wallpaper[] = [
  {
    id: "default",
    label: "Default",
    preview: "linear-gradient(145deg, #f4f4f5 0%, #ffffff 100%)",
    background: "var(--background)",
    kind: "gradient",
  },
  {
    id: "aurora",
    label: "Aurora",
    preview:
      "radial-gradient(circle at 15% 20%, #8e5af766, transparent 55%), radial-gradient(circle at 85% 75%, #34c75955, transparent 50%), linear-gradient(145deg, #f4f4f5, #ffffff)",
    background:
      "radial-gradient(ellipse 90% 70% at 8% 12%, color-mix(in oklch, #8e5af7 28%, transparent), transparent 58%), radial-gradient(ellipse 80% 60% at 92% 88%, color-mix(in oklch, #34c759 22%, transparent), transparent 55%), var(--background)",
    kind: "gradient",
  },
  {
    id: "sunset",
    label: "Sunset",
    preview:
      "radial-gradient(circle at 80% 15%, #ff950066, transparent 50%), radial-gradient(circle at 20% 85%, #ff6b6b55, transparent 52%), linear-gradient(145deg, #fff7f2, #ffffff)",
    background:
      "radial-gradient(ellipse 85% 65% at 88% 8%, color-mix(in oklch, #ff9500 26%, transparent), transparent 55%), radial-gradient(ellipse 75% 55% at 10% 92%, color-mix(in oklch, #ff6b6b 22%, transparent), transparent 52%), var(--background)",
    kind: "gradient",
  },
  {
    id: "ocean",
    label: "Ocean",
    preview:
      "radial-gradient(circle at 20% 25%, #5ac8fa66, transparent 52%), radial-gradient(circle at 85% 80%, #007aff44, transparent 50%), linear-gradient(145deg, #f2f8ff, #ffffff)",
    background:
      "radial-gradient(ellipse 80% 60% at 12% 18%, color-mix(in oklch, #5ac8fa 26%, transparent), transparent 55%), radial-gradient(ellipse 70% 55% at 90% 85%, color-mix(in oklch, #007aff 20%, transparent), transparent 52%), var(--background)",
    kind: "gradient",
  },
  {
    id: "forest",
    label: "Forest",
    preview:
      "radial-gradient(circle at 25% 70%, #34c75955, transparent 52%), radial-gradient(circle at 80% 20%, #a8947844, transparent 50%), linear-gradient(145deg, #f4faf5, #ffffff)",
    background:
      "radial-gradient(ellipse 75% 60% at 18% 78%, color-mix(in oklch, #34c759 22%, transparent), transparent 55%), radial-gradient(ellipse 65% 50% at 82% 15%, color-mix(in oklch, #a89478 18%, transparent), transparent 50%), var(--background)",
    kind: "gradient",
  },
  {
    id: "midnight",
    label: "Midnight",
    preview:
      "radial-gradient(circle at 70% 25%, #8e5af788, transparent 52%), radial-gradient(circle at 25% 80%, #007aff55, transparent 50%), linear-gradient(145deg, #1a1a2e, #0f0f14)",
    background:
      "radial-gradient(ellipse 85% 65% at 75% 12%, color-mix(in oklch, #8e5af7 35%, transparent), transparent 58%), radial-gradient(ellipse 70% 55% at 15% 88%, color-mix(in oklch, #007aff 24%, transparent), transparent 52%), var(--background)",
    kind: "gradient",
  },
  {
    id: "rose",
    label: "Rose",
    preview:
      "radial-gradient(circle at 75% 20%, #ff70c166, transparent 52%), radial-gradient(circle at 20% 80%, #ff6b6b44, transparent 50%), linear-gradient(145deg, #fff5f8, #ffffff)",
    background:
      "radial-gradient(ellipse 80% 60% at 82% 10%, color-mix(in oklch, #ff70c1 24%, transparent), transparent 55%), radial-gradient(ellipse 70% 55% at 12% 90%, color-mix(in oklch, #ff6b6b 18%, transparent), transparent 52%), var(--background)",
    kind: "gradient",
  },
];

export const PRESET_WALLPAPER_IDS = new Set<WallpaperId>(
  WALLPAPERS.map((wallpaper) => wallpaper.id),
);

export const WALLPAPER_IDS = new Set<WallpaperId>([
  ...PRESET_WALLPAPER_IDS,
  CUSTOM_WALLPAPER_ID,
]);
