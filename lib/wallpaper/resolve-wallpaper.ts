import type { CSSProperties } from "react";
import { DEFAULT_WALLPAPER_ID, WALLPAPERS } from "@/config/wallpapers";
import {
  type CustomWallpaperSlots,
  customWallpaperIdForSlot,
  isCustomWallpaperId,
  LEGACY_CUSTOM_WALLPAPER_ID,
  normalizeStoredWallpaperId,
  slotForCustomWallpaperId,
} from "@/lib/wallpaper/custom-wallpaper";
import { formatCustomWallpaperLabel } from "@/config/settings-labels";
import type { Wallpaper, WallpaperId } from "@/types/wallpaper";

export function resolveWallpaper(id: WallpaperId): Wallpaper {
  return WALLPAPERS.find((wallpaper) => wallpaper.id === id) ?? WALLPAPERS[0];
}

export function resolveCustomWallpaper(
  imageUrl: string,
  slot: number,
): Wallpaper {
  return {
    id: customWallpaperIdForSlot(slot),
    label: formatCustomWallpaperLabel(slot),
    preview: imageUrl,
    background: imageUrl,
    kind: "image",
  };
}

export function resolveActiveWallpaper(
  id: WallpaperId,
  customWallpaperSlots: CustomWallpaperSlots,
): Wallpaper {
  const normalizedId = normalizeStoredWallpaperId(id) as WallpaperId;
  const slot = slotForCustomWallpaperId(normalizedId);

  if (slot !== null) {
    const imageUrl = customWallpaperSlots[slot];
    if (imageUrl) {
      return resolveCustomWallpaper(imageUrl, slot);
    }

    return resolveWallpaper(DEFAULT_WALLPAPER_ID);
  }

  return resolveWallpaper(normalizedId);
}

export function isActiveCustomWallpaper(
  id: WallpaperId,
  customWallpaperSlots: CustomWallpaperSlots,
): boolean {
  const slot = slotForCustomWallpaperId(normalizeStoredWallpaperId(id));
  return slot !== null && customWallpaperSlots[slot] !== null;
}

export function getDefaultWallpaperId(): WallpaperId {
  return DEFAULT_WALLPAPER_ID;
}

const WALLPAPER_FILL: CSSProperties = {
  backgroundSize: "cover",
  backgroundPosition: "center",
  backgroundRepeat: "no-repeat",
};

const GRADIENT_BACKGROUND_COLOR_SUFFIX = ", var(--background)";

function getGradientWallpaperStyle(background: string): CSSProperties {
  if (background === "var(--background)") {
    return { backgroundColor: background };
  }

  if (background.endsWith(GRADIENT_BACKGROUND_COLOR_SUFFIX)) {
    return {
      backgroundColor: "var(--background)",
      backgroundImage: background.slice(
        0,
        -GRADIENT_BACKGROUND_COLOR_SUFFIX.length,
      ),
      ...WALLPAPER_FILL,
    };
  }

  return {
    backgroundImage: background,
    ...WALLPAPER_FILL,
  };
}

export function getWallpaperBackgroundStyle(
  wallpaper: Wallpaper,
): CSSProperties {
  if (wallpaper.kind === "image") {
    return {
      backgroundColor: "var(--background)",
      backgroundImage: `url("${wallpaper.background}")`,
      ...WALLPAPER_FILL,
    };
  }

  return getGradientWallpaperStyle(wallpaper.background);
}

/** Full-screen wallpaper layer — longhand only (avoids React shorthand conflicts). */
export function getWallpaperLayerStyle(wallpaper: Wallpaper): CSSProperties {
  return getWallpaperBackgroundStyle(wallpaper);
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

  return getGradientWallpaperStyle(wallpaper.preview);
}

export { isCustomWallpaperId, LEGACY_CUSTOM_WALLPAPER_ID };
