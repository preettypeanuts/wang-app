"use client";

import { useState } from "react";

import { useWallpaper } from "@/components/shared/wallpaper-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  SETTINGS_INSET_BLOCK,
  SETTINGS_ROW_DIVIDER,
} from "@/config/settings-layout";
import {
  WALLPAPER_IMPORT_ACTION,
  WALLPAPER_IMPORT_FROM_URL,
  WALLPAPER_IMPORT_URL_HINT,
} from "@/config/settings-labels";
import { cn } from "@/lib/utils";

export function WallpaperUrlImport() {
  const [url, setUrl] = useState("");
  const {
    canUploadMoreCustomWallpapers,
    isUploading,
    uploadCustomWallpaperFromUrl,
  } = useWallpaper();

  const disabled = isUploading || !canUploadMoreCustomWallpapers;
  const canSubmit = url.trim().length > 0 && !disabled;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!canSubmit) {
      return;
    }

    await uploadCustomWallpaperFromUrl(url);
    setUrl("");
  }

  return (
    <form
      onSubmit={(event) => void handleSubmit(event)}
      className={cn(SETTINGS_INSET_BLOCK, SETTINGS_ROW_DIVIDER, "space-y-2")}
    >
      <label
        htmlFor="wallpaper-url"
        className="text-xs font-medium text-muted-foreground"
      >
        {WALLPAPER_IMPORT_FROM_URL}
      </label>
      <div className="flex items-center gap-2">
        <Input
          id="wallpaper-url"
          type="url"
          inputMode="url"
          autoComplete="off"
          placeholder="https://..."
          value={url}
          onChange={(event) => setUrl(event.target.value)}
          disabled={disabled}
          className="h-9 flex-1 text-sm"
        />
        <Button
          type="submit"
          size="sm"
          className="h-9 shrink-0 px-3"
          disabled={!canSubmit}
        >
          {isUploading ? "..." : WALLPAPER_IMPORT_ACTION}
        </Button>
      </div>
      <p className="text-[11px] leading-relaxed text-muted-foreground">
        {WALLPAPER_IMPORT_URL_HINT}
      </p>
    </form>
  );
}
