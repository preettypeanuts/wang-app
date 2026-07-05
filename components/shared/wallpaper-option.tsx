"use client";

import { getWallpaperPreviewStyle } from "@/lib/wallpaper/resolve-wallpaper";
import { SEPARATED_CONTROL } from "@/config/shape";
import type { Wallpaper } from "@/types/wallpaper";
import { CheckIcon } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

interface WallpaperOptionProps {
  wallpaper: Wallpaper;
  selected: boolean;
  onSelect: (id: Wallpaper["id"]) => void;
}

export function WallpaperOption({
  wallpaper,
  selected,
  onSelect,
}: WallpaperOptionProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(wallpaper.id)}
      aria-pressed={selected}
      aria-label={`Wallpaper ${wallpaper.label}`}
      className={cn(
        SEPARATED_CONTROL,
        "group relative overflow-hidden text-left ring-1 ring-foreground/10 transition-all hover:ring-foreground/20",
        selected && "ring-2 ring-foreground/40",
      )}
    >
      <div
        className="aspect-4/3 w-full rounded-t-xl"
        style={getWallpaperPreviewStyle(wallpaper)}
      />
      <div className="flex items-center justify-between gap-2 px-2.5 py-2">
        <span className="truncate text-xs font-medium">{wallpaper.label}</span>
        {selected ? (
          <CheckIcon
            className="size-3.5 shrink-0 text-foreground"
            weight="bold"
          />
        ) : null}
      </div>
    </button>
  );
}
