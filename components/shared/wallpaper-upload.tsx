"use client";

import { useRef } from "react";

import { UploadSimpleIcon } from "@/lib/icons";

import { useWallpaper } from "@/components/shared/wallpaper-provider";
import { Button } from "@/components/ui/button";
import { CUSTOM_WALLPAPER_ID } from "@/config/wallpapers";
import {
  SETTINGS_ROW,
  SETTINGS_ROW_DIVIDER,
} from "@/config/settings-layout";
import { cn } from "@/lib/utils";

export function WallpaperUpload() {
  const inputRef = useRef<HTMLInputElement>(null);
  const {
    customWallpaperUrl,
    wallpaperId,
    isUploading,
    uploadError,
    uploadCustomWallpaper,
    removeCustomWallpaper,
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
        disabled={isUploading}
        onClick={() => inputRef.current?.click()}
        className={cn(
          SETTINGS_ROW,
          SETTINGS_ROW_DIVIDER,
          "justify-center gap-2 font-medium text-primary disabled:opacity-50",
        )}
      >
        <UploadSimpleIcon className="size-4" />
        {isUploading ? "Memproses..." : "Upload wallpaper sendiri"}
      </button>
      {uploadError ? (
        <p className="px-4 py-2 text-xs text-destructive">{uploadError}</p>
      ) : null}
      {customWallpaperUrl && wallpaperId === CUSTOM_WALLPAPER_ID ? (
        <div className={cn(SETTINGS_ROW, SETTINGS_ROW_DIVIDER, "justify-center")}>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 px-2 text-xs text-destructive"
            onClick={() => void removeCustomWallpaper()}
          >
            Hapus wallpaper kustom
          </Button>
        </div>
      ) : null}
    </>
  );
}
