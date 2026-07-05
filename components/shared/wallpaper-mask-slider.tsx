"use client";

import { useWallpaper } from "@/components/shared/wallpaper-provider";
import { WallpaperMaskColorPicker } from "@/components/shared/wallpaper-mask-color-picker";
import { Slider } from "@/components/ui/slider";
import {
  WALLPAPER_MASK_MAX,
  WALLPAPER_MASK_MIN,
  WALLPAPER_MASK_STEP,
} from "@/config/wallpaper-mask";
import {
  SETTINGS_INSET_BLOCK,
  SETTINGS_ROW_DIVIDER,
} from "@/config/settings-layout";
import { cn } from "@/lib/utils";

export function WallpaperMaskSlider() {
  const { maskOpacity, setMaskOpacity, wallpaperId } = useWallpaper();
  const isDefaultWallpaper = wallpaperId === "default";

  return (
    <div
      className={cn(
        SETTINGS_INSET_BLOCK,
        SETTINGS_ROW_DIVIDER,
        "space-y-3",
        isDefaultWallpaper && "opacity-70",
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <label
          htmlFor="wallpaper-mask-slider"
          className="text-sm font-medium leading-none"
        >
          Mask aksesibilitas
        </label>
        <span className="text-xs tabular-nums text-muted-foreground">
          {maskOpacity}%
        </span>
      </div>
      <div className="space-y-2">
        <span className="text-xs font-medium text-muted-foreground">Warna</span>
        <WallpaperMaskColorPicker disabled={isDefaultWallpaper} />
      </div>
      <Slider
        id="wallpaper-mask-slider"
        value={[maskOpacity]}
        onValueChange={(value) => {
          const nextValue = Array.isArray(value) ? value[0] : value;
          setMaskOpacity(nextValue ?? WALLPAPER_MASK_MIN);
        }}
        min={WALLPAPER_MASK_MIN}
        max={WALLPAPER_MASK_MAX}
        step={WALLPAPER_MASK_STEP}
        disabled={isDefaultWallpaper}
        aria-label="Tingkat mask wallpaper untuk keterbacaan"
      />
      <p className="text-[11px] leading-relaxed text-muted-foreground">
        {isDefaultWallpaper
          ? "Pilih wallpaper selain Default untuk menyesuaikan overlay."
          : "Naikkan jika teks atau UI sulit dibaca di atas wallpaper."}
      </p>
    </div>
  );
}
