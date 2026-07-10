"use client";

import { useAppearance } from "@/components/shared/appearance-provider";
import { ACCENT_COLORS } from "@/config/accent-colors";
import { SETTINGS_ACCENT_COLOR } from "@/config/settings-labels";
import { SETTINGS_INSET_BLOCK } from "@/config/settings-layout";
import { cn } from "@/lib/utils";

export function AccentColorPicker() {
  const { accentId, setAccentId, resolvedDark } = useAppearance();

  return (
    <div className={SETTINGS_INSET_BLOCK}>
      <fieldset className="grid grid-cols-4 gap-x-1 gap-y-3 border-0 p-0">
        <legend className="sr-only">{SETTINGS_ACCENT_COLOR}</legend>
        {ACCENT_COLORS.map((accent) => {
          const selected = accentId === accent.id;
          const swatch = resolvedDark ? accent.dark : accent.light;

          return (
            <button
              key={accent.id}
              type="button"
              aria-pressed={selected}
              aria-label={accent.label}
              onClick={() => setAccentId(accent.id)}
              className="flex flex-col items-center gap-1.5 rounded-lg px-0.5 py-0.5 transition-opacity active:opacity-80"
            >
              <span
                aria-hidden
                className={cn(
                  "size-[22px] shrink-0 rounded-full",
                  selected
                    ? "ring-2 ring-foreground/90 ring-offset-2 ring-offset-background"
                    : "ring-1 ring-black/12 dark:ring-white/20",
                )}
                style={{ backgroundColor: swatch }}
              />
              <span
                className={cn(
                  "max-w-full truncate text-center text-[10px] leading-none",
                  selected
                    ? "font-semibold text-foreground"
                    : "font-medium text-muted-foreground",
                )}
              >
                {accent.label}
              </span>
            </button>
          );
        })}
      </fieldset>
    </div>
  );
}
