import { DEFAULT_WALLPAPER_ID, WALLPAPER_IDS } from "@/config/wallpapers";
import type { WallpaperId } from "@/types/wallpaper";

const STORAGE_KEY = "monmon:wallpaper";

export function isWallpaperId(value: string): value is WallpaperId {
  return WALLPAPER_IDS.has(value as WallpaperId);
}

export function readStoredWallpaperId(): WallpaperId {
  if (typeof window === "undefined") {
    return DEFAULT_WALLPAPER_ID;
  }

  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (!stored || !isWallpaperId(stored)) {
    return DEFAULT_WALLPAPER_ID;
  }

  return stored;
}

export function writeStoredWallpaperId(id: WallpaperId): void {
  window.localStorage.setItem(STORAGE_KEY, id);
}
