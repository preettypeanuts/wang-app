"use client";

import { WallpaperOption } from "@/components/shared/wallpaper-option";
import { useWallpaper } from "@/components/shared/wallpaper-provider";
import { SETTINGS_INSET_BLOCK } from "@/config/settings-layout";
import { GRID_GAP } from "@/config/spacing";
import { WALLPAPERS } from "@/config/wallpapers";
import { cn } from "@/lib/utils";
import { listFilledCustomWallpaperSlots } from "@/lib/wallpaper/custom-wallpaper";
import { resolveCustomWallpaper } from "@/lib/wallpaper/resolve-wallpaper";

export function WallpaperGrid() {
  const {
    wallpaperId,
    customWallpaperSlots,
    setWallpaperId,
    removeCustomWallpaper,
  } = useWallpaper();
  const customWallpapers = listFilledCustomWallpaperSlots(customWallpaperSlots);

  return (
    <div className={cn(SETTINGS_INSET_BLOCK, "grid grid-cols-2", GRID_GAP)}>
      {customWallpapers.map(({ slot, url }) => {
        const wallpaper = resolveCustomWallpaper(url, slot);

        return (
          <WallpaperOption
            key={wallpaper.id}
            wallpaper={wallpaper}
            selected={wallpaperId === wallpaper.id}
            onSelect={setWallpaperId}
            onRemove={() => removeCustomWallpaper(slot)}
          />
        );
      })}
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
