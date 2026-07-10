"use client";

import { SettingsSheet } from "@/components/shared/settings-sheet";
import {
  SidebarDockItem,
  useSidebarDockTooltipVisible,
} from "@/components/shared/sidebar-dock";
import { SETTINGS_TITLE } from "@/config/settings-labels";
import {
  SIDEBAR_APP_ICON_GLYPH,
  SIDEBAR_APP_ICON_GRADIENTS,
  SIDEBAR_APP_ICON_SHELL,
} from "@/config/sidebar";
import { GearSixIcon } from "@/lib/icons";
import { cn } from "@/lib/utils";

const DOCK_TRIGGER_CLASS =
  "flex size-9 items-center justify-center rounded-[0.7rem] outline-none transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-white/70";

const DOCK_LABEL_BASE =
  "pointer-events-none absolute top-1/2 left-[calc(100%+0.625rem)] z-50 -translate-y-1/2 whitespace-nowrap rounded-lg bg-foreground px-2.5 py-1 text-xs font-medium text-background shadow-md transition-opacity duration-100";

function DockLabel({ label }: { label: string }) {
  const visible = useSidebarDockTooltipVisible();

  return (
    <span
      className={cn(DOCK_LABEL_BASE, visible ? "opacity-100" : "opacity-0")}
      aria-hidden={!visible}
    >
      {label}
    </span>
  );
}

interface SidebarCollapsedSettingsProps {
  index: number;
}

export function SidebarCollapsedSettings({ index }: SidebarCollapsedSettingsProps) {
  return (
    <SidebarDockItem index={index}>
      <div className="relative flex items-center justify-center">
        <SettingsSheet
          trigger={
            <button
              type="button"
              aria-label={SETTINGS_TITLE}
              className={DOCK_TRIGGER_CLASS}
            >
              <span
                className={cn(
                  SIDEBAR_APP_ICON_SHELL,
                  "bg-linear-to-b",
                  SIDEBAR_APP_ICON_GRADIENTS.settings,
                )}
              >
                <GearSixIcon className={SIDEBAR_APP_ICON_GLYPH} />
              </span>
            </button>
          }
        />
        <DockLabel label={SETTINGS_TITLE} />
      </div>
    </SidebarDockItem>
  );
}
