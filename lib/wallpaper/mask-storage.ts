import {
  DEFAULT_WALLPAPER_MASK,
  WALLPAPER_MASK_COLOR_IDS,
  WALLPAPER_MASK_MAX,
  WALLPAPER_MASK_MIN,
} from "@/config/wallpaper-mask";
import type { WallpaperMaskColor } from "@/types/wallpaper";

const STORAGE_KEY = "monmon:wallpaper-mask";
const COLOR_STORAGE_KEY = "monmon:wallpaper-mask-color";

function readThemeAwareMaskColor(): WallpaperMaskColor {
  if (typeof window === "undefined") {
    return "black";
  }

  return document.documentElement.classList.contains("dark") ? "black" : "white";
}

export function clampWallpaperMask(value: number): number {
  return Math.min(WALLPAPER_MASK_MAX, Math.max(WALLPAPER_MASK_MIN, value));
}

export function readStoredWallpaperMask(): number {
  if (typeof window === "undefined") {
    return DEFAULT_WALLPAPER_MASK;
  }

  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    return DEFAULT_WALLPAPER_MASK;
  }

  const parsed = Number.parseInt(stored, 10);
  if (Number.isNaN(parsed)) {
    return DEFAULT_WALLPAPER_MASK;
  }

  return clampWallpaperMask(parsed);
}

export function writeStoredWallpaperMask(value: number): void {
  window.localStorage.setItem(STORAGE_KEY, String(clampWallpaperMask(value)));
}

export function readStoredWallpaperMaskColor(): WallpaperMaskColor {
  if (typeof window === "undefined") {
    return readThemeAwareMaskColor();
  }

  const stored = window.localStorage.getItem(COLOR_STORAGE_KEY);
  if (!stored || !WALLPAPER_MASK_COLOR_IDS.has(stored as WallpaperMaskColor)) {
    return readThemeAwareMaskColor();
  }

  return stored as WallpaperMaskColor;
}

export function writeStoredWallpaperMaskColor(value: WallpaperMaskColor): void {
  window.localStorage.setItem(COLOR_STORAGE_KEY, value);
}
