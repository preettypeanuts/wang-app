"use client";

import { CheckIcon } from "@/lib/icons";

import { useWallpaper } from "@/components/shared/wallpaper-provider";
import { WALLPAPER_MASK_COLORS } from "@/config/wallpaper-mask";
import { SEPARATED_CONTROL, SEPARATED_PILL } from "@/config/shape";
import { cn } from "@/lib/utils";

interface WallpaperMaskColorPickerProps {
  disabled?: boolean;
}

export function WallpaperMaskColorPicker({
  disabled = false,
}: WallpaperMaskColorPickerProps) {
  const { maskColor, setMaskColor } = useWallpaper();

  return (
    <div className="grid grid-cols-2 gap-2">
      {WALLPAPER_MASK_COLORS.map((color) => {
        const selected = maskColor === color.id;

        return (
          <button
            key={color.id}
            type="button"
            aria-pressed={selected}
            aria-label={`Mask ${color.label}`}
            disabled={disabled}
            onClick={() => setMaskColor(color.id)}
            className={cn(
              SEPARATED_CONTROL,
              "flex items-center gap-2 px-2.5 py-2 text-left text-xs font-medium transition-colors",
              selected && "ring-2 ring-foreground/30",
              disabled && "cursor-not-allowed opacity-60",
            )}
          >
            <span
              className={cn(
                "relative flex size-5 shrink-0 items-center justify-center",
                SEPARATED_PILL,
                color.swatchClassName,
              )}
            >
              {selected ? (
                <CheckIcon
                  className={cn(
                    "size-3",
                    color.id === "white" ? "text-black" : "text-white",
                  )}
                />
              ) : null}
            </span>
            <span className="truncate">{color.label}</span>
          </button>
        );
      })}
    </div>
  );
}
