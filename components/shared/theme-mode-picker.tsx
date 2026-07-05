"use client";

import {
  DesktopIcon,
  MoonIcon,
  SunIcon,
  type Icon,
} from "@phosphor-icons/react";

import { useAppearance } from "@/components/shared/appearance-provider";
import { THEME_MODES } from "@/config/theme-modes";
import {
  SETTINGS_INSET_BLOCK,
  SETTINGS_SEGMENTED_ITEM,
  SETTINGS_SEGMENTED_ITEM_ACTIVE,
  SETTINGS_SEGMENTED_TRACK,
} from "@/config/settings-layout";
import type { ThemeMode } from "@/types/appearance";
import { cn } from "@/lib/utils";

const MODE_ICONS: Record<ThemeMode, Icon> = {
  light: SunIcon,
  dark: MoonIcon,
  system: DesktopIcon,
};

export function ThemeModePicker() {
  const { themeMode, setThemeMode } = useAppearance();

  return (
    <div className={SETTINGS_INSET_BLOCK}>
      <div
        className={SETTINGS_SEGMENTED_TRACK}
        role="group"
        aria-label="Mode tema"
      >
        {THEME_MODES.map((mode) => {
          const IconComponent = MODE_ICONS[mode.id];
          const selected = themeMode === mode.id;

          return (
            <button
              key={mode.id}
              type="button"
              aria-pressed={selected}
              onClick={() => setThemeMode(mode.id)}
              className={cn(
                SETTINGS_SEGMENTED_ITEM,
                selected
                  ? SETTINGS_SEGMENTED_ITEM_ACTIVE
                  : "text-muted-foreground",
              )}
            >
              <IconComponent
                className="size-4"
                weight={selected ? "fill" : "regular"}
              />
              {mode.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
