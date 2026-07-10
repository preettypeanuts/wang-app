"use client";

import { usePathname } from "next/navigation";

import { SidebarProfileDropdown } from "@/components/shared/sidebar-profile-dropdown";
import {
  SidebarDockItem,
  useSidebarDockTooltipVisible,
} from "@/components/shared/sidebar-dock";
import { SETTINGS_DEFAULT_USER } from "@/config/settings-labels";
import { GLASS_SURFACE } from "@/config/glass";
import { SEPARATED_CONTROL } from "@/config/shape";
import { useSession } from "@/lib/auth/auth-client";
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

function DockActiveDot({ active }: { active: boolean }) {
  if (!active) {
    return null;
  }

  return (
    <span
      aria-hidden
      className="pointer-events-none absolute top-1/2 -right-1.75 size-1 -translate-y-1/2 rounded-full bg-white"
    />
  );
}

interface SidebarCollapsedProfileProps {
  index: number;
}

export function SidebarCollapsedProfile({ index }: SidebarCollapsedProfileProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const name = session?.user?.name?.trim() || SETTINGS_DEFAULT_USER;
  const initial = name.charAt(0).toUpperCase() || "W";
  const isActive = pathname === "/profile";

  return (
    <SidebarDockItem index={index}>
      <div className="relative flex items-center justify-center">
        <SidebarProfileDropdown
          contentSide="right"
          contentAlign="end"
          contentSideOffset={10}
          trigger={
            <button
              type="button"
              aria-label={name}
              className={DOCK_TRIGGER_CLASS}
            >
              <span
                className={cn(
                  GLASS_SURFACE,
                  SEPARATED_CONTROL,
                  "flex size-9 items-center justify-center rounded-[0.7rem] text-xs font-semibold text-foreground",
                )}
              >
                {initial}
              </span>
            </button>
          }
        />
        <DockLabel label={name} />
        <DockActiveDot active={isActive} />
      </div>
    </SidebarDockItem>
  );
}
