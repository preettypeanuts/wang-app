import { DEFAULT_WALLPAPER_ID, WALLPAPER_IDS } from "@/config/wallpapers";
import { normalizeStoredWallpaperId } from "@/lib/wallpaper/custom-wallpaper";
import type { WallpaperId } from "@/types/wallpaper";

const STORAGE_KEY = "wang:wallpaper";

export function isWallpaperId(value: string): value is WallpaperId {
  const normalized = normalizeStoredWallpaperId(value);
  return WALLPAPER_IDS.has(normalized as WallpaperId);
}

export function readStoredWallpaperId(): WallpaperId {
  if (typeof window === "undefined") {
    return DEFAULT_WALLPAPER_ID;
  }

  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (!stored || !isWallpaperId(stored)) {
    return DEFAULT_WALLPAPER_ID;
  }

  return normalizeStoredWallpaperId(stored) as WallpaperId;
}

export function writeStoredWallpaperId(id: WallpaperId): void {
  window.localStorage.setItem(STORAGE_KEY, id);
}
