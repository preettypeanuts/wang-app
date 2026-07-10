"use client";

import { useRef } from "react";
import { useWallpaper } from "@/components/shared/wallpaper-provider";
import { SETTINGS_ROW, SETTINGS_ROW_DIVIDER } from "@/config/settings-layout";
import {
  formatWallpaperUploadLabel,
  WALLPAPER_SLOTS_FULL,
  WALLPAPER_UPLOAD_PROCESSING,
} from "@/config/settings-labels";
import { MAX_CUSTOM_WALLPAPERS } from "@/config/wallpapers";
import { UploadSimpleIcon } from "@/lib/icons";
import { cn } from "@/lib/utils";

export function WallpaperUpload() {
  const inputRef = useRef<HTMLInputElement>(null);
  const {
    customWallpaperCount,
    canUploadMoreCustomWallpapers,
    isUploading,
    uploadError,
    uploadCustomWallpaper,
  } = useWallpaper();

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) {
      return;
    }

    await uploadCustomWallpaper(file);
  }

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="sr-only"
        onChange={(event) => void handleFileChange(event)}
      />
      <button
        type="button"
        disabled={isUploading || !canUploadMoreCustomWallpapers}
        onClick={() => inputRef.current?.click()}
        className={cn(
          SETTINGS_ROW,
          SETTINGS_ROW_DIVIDER,
          "justify-center gap-2 font-medium text-primary disabled:opacity-50",
        )}
      >
        <UploadSimpleIcon className="size-4" />
        {isUploading
          ? WALLPAPER_UPLOAD_PROCESSING
          : formatWallpaperUploadLabel(customWallpaperCount)}
      </button>
      {!canUploadMoreCustomWallpapers ? (
        <p className="px-4 py-2 text-center text-[11px] text-muted-foreground">
          {WALLPAPER_SLOTS_FULL}
        </p>
      ) : null}
      {uploadError ? (
        <p className="px-4 py-2 text-xs text-destructive">{uploadError}</p>
      ) : null}
    </>
  );
}
