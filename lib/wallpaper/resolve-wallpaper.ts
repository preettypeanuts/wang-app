import {
  CUSTOM_WALLPAPER_ID,
  DEFAULT_WALLPAPER_ID,
  WALLPAPERS,
} from "@/config/wallpapers";
import type { CSSProperties } from "react";
import type { Wallpaper, WallpaperId } from "@/types/wallpaper";

export function resolveWallpaper(id: WallpaperId): Wallpaper {
  return WALLPAPERS.find((wallpaper) => wallpaper.id === id) ?? WALLPAPERS[0];
}

export function resolveCustomWallpaper(imageUrl: string): Wallpaper {
  return {
    id: CUSTOM_WALLPAPER_ID,
    label: "Kustom",
    preview: imageUrl,
    background: imageUrl,
    kind: "image",
  };
}

export function resolveActiveWallpaper(
  id: WallpaperId,
  customWallpaperUrl: string | null,
): Wallpaper {
  if (id === CUSTOM_WALLPAPER_ID && customWallpaperUrl) {
    return resolveCustomWallpaper(customWallpaperUrl);
  }

  if (id === CUSTOM_WALLPAPER_ID) {
    return resolveWallpaper(DEFAULT_WALLPAPER_ID);
  }

  return resolveWallpaper(id);
}

export function getDefaultWallpaperId(): WallpaperId {
  return DEFAULT_WALLPAPER_ID;
}

export function getWallpaperBackgroundStyle(
  wallpaper: Wallpaper,
): CSSProperties {
  if (wallpaper.kind === "image") {
    return {
      backgroundColor: "var(--background)",
      backgroundImage: `url("${wallpaper.background}")`,
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundRepeat: "no-repeat",
    };
  }

  return { background: wallpaper.background };
}

export function getWallpaperPreviewStyle(
  wallpaper: Pick<Wallpaper, "kind" | "preview">,
): CSSProperties {
  if (wallpaper.kind === "image") {
    return {
      backgroundImage: `url("${wallpaper.preview}")`,
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundRepeat: "no-repeat",
    };
  }

  return { background: wallpaper.preview };
}
