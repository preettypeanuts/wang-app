"use client";

import {
  formatRemoveWallpaperLabel,
  formatWallpaperAriaLabel,
} from "@/config/settings-labels";
import { SEPARATED_CONTROL } from "@/config/shape";
import { useIsMobileViewport } from "@/hooks/use-is-mobile-viewport";
import { CheckIcon, TrashIcon } from "@/lib/icons";
import { cn } from "@/lib/utils";
import { getWallpaperPreviewStyle } from "@/lib/wallpaper/resolve-wallpaper";
import type { Wallpaper } from "@/types/wallpaper";

interface WallpaperOptionProps {
  wallpaper: Wallpaper;
  selected: boolean;
  onSelect: (id: Wallpaper["id"]) => void;
  onRemove?: () => void;
}

export function WallpaperOption({
  wallpaper,
  selected,
  onSelect,
  onRemove,
}: WallpaperOptionProps) {
  const isMobile = useIsMobileViewport();

  return (
    <div
      className={cn(
        SEPARATED_CONTROL,
        "group relative overflow-hidden ring-1 ring-foreground/10 transition-all hover:ring-foreground/20",
        selected && "ring-2 ring-foreground/40",
      )}
    >
      <button
        type="button"
        onClick={() => onSelect(wallpaper.id)}
        aria-pressed={selected}
        aria-label={formatWallpaperAriaLabel(wallpaper.label)}
        className="w-full text-left"
      >
        <div
          className="aspect-4/3 w-full rounded-t-xl"
          style={getWallpaperPreviewStyle(wallpaper)}
        />
        <div className="flex items-center justify-between gap-2 px-2.5 py-2">
          <span className="truncate text-xs font-medium">
            {wallpaper.label}
          </span>
          {selected ? (
            <CheckIcon className="size-3.5 shrink-0 text-foreground" />
          ) : null}
        </div>
      </button>

      {onRemove ? (
        <button
          type="button"
          aria-label={formatRemoveWallpaperLabel(wallpaper.label)}
          onClick={() => void onRemove()}
          className={cn(
            "absolute top-2 right-2 z-10 flex size-7 items-center justify-center rounded-full",
            "bg-black/45 text-white shadow-sm ring-1 ring-white/20 backdrop-blur-sm",
            "transition-opacity hover:bg-black/60",
            "focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:outline-none",
            isMobile
              ? "opacity-70"
              : "opacity-0 group-hover:opacity-100 group-focus-within:opacity-100",
          )}
        >
          <TrashIcon className="size-3.5" />
        </button>
      ) : null}
    </div>
  );
}
