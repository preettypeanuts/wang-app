"use client";

import { useWallpaper } from "@/components/shared/wallpaper-provider";
import { getWallpaperBackgroundStyle } from "@/lib/wallpaper/resolve-wallpaper";

export function WallpaperBackground() {
  const { wallpaper, maskOpacity, maskColor } = useWallpaper();

  return (
    <>
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10 transition-[background,background-image] duration-500 ease-out"
        style={getWallpaperBackgroundStyle(wallpaper)}
      />
      <div
        aria-hidden
        className={
          maskColor === "black"
            ? "pointer-events-none fixed inset-0 -z-10 bg-black transition-opacity duration-300"
            : "pointer-events-none fixed inset-0 -z-10 bg-white transition-opacity duration-300"
        }
        style={{ opacity: maskOpacity / 100 }}
      />
    </>
  );
}
