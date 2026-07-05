"use client";

import { CheckIcon } from "@/lib/icons";

import { useAppearance } from "@/components/shared/appearance-provider";
import { ACCENT_COLORS } from "@/config/accent-colors";
import {
  SETTINGS_ROW,
  SETTINGS_ROW_DIVIDER,
} from "@/config/settings-layout";
import { SEPARATED_PILL } from "@/config/shape";
import { cn } from "@/lib/utils";

export function AccentColorPicker() {
  const { accentId, setAccentId } = useAppearance();

  return (
    <>
      {ACCENT_COLORS.map((accent, index) => {
        const selected = accentId === accent.id;
        const isLast = index === ACCENT_COLORS.length - 1;

        return (
          <button
            key={accent.id}
            type="button"
            aria-pressed={selected}
            aria-label={`Accent ${accent.label}`}
            onClick={() => setAccentId(accent.id)}
            className={cn(
              SETTINGS_ROW,
              !isLast && SETTINGS_ROW_DIVIDER,
            )}
          >
            <span
              className={cn(
                "size-6 shrink-0 ring-1 ring-black/10 dark:ring-white/15",
                SEPARATED_PILL,
              )}
              style={{ backgroundColor: accent.swatch }}
            />
            <span className="flex-1 font-medium">{accent.label}</span>
            {selected ? (
              <CheckIcon className="size-4 text-primary" />
            ) : (
              <span className="size-4 shrink-0" aria-hidden />
            )}
          </button>
        );
      })}
    </>
  );
}
