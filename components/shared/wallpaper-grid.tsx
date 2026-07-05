"use client";

import { WallpaperOption } from "@/components/shared/wallpaper-option";
import { useWallpaper } from "@/components/shared/wallpaper-provider";
import { CUSTOM_WALLPAPER_ID, WALLPAPERS } from "@/config/wallpapers";
import { GRID_GAP } from "@/config/spacing";
import { resolveCustomWallpaper } from "@/lib/wallpaper/resolve-wallpaper";
import { cn } from "@/lib/utils";

export function WallpaperGrid() {
  const { wallpaperId, customWallpaperUrl, setWallpaperId } = useWallpaper();
  const customWallpaper = customWallpaperUrl
    ? resolveCustomWallpaper(customWallpaperUrl)
    : null;

  return (
    <div className={cn("grid grid-cols-2", GRID_GAP)}>
      {customWallpaper ? (
        <WallpaperOption
          wallpaper={customWallpaper}
          selected={wallpaperId === CUSTOM_WALLPAPER_ID}
          onSelect={setWallpaperId}
        />
      ) : null}
      {WALLPAPERS.map((wallpaper) => (
        <WallpaperOption
          key={wallpaper.id}
          wallpaper={wallpaper}
          selected={wallpaperId === wallpaper.id}
          onSelect={setWallpaperId}
        />
      ))}
    </div>
  );
}
