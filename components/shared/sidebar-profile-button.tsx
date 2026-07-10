"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { SidebarProfileMenu } from "@/components/shared/sidebar-profile-menu";
import { SidebarMenuItem } from "@/components/ui/sidebar";
import { APP_TAGLINE } from "@/config/app";
import { SETTINGS_DEFAULT_USER } from "@/config/settings-labels";
import { SEPARATED_MENU_ITEM, SIDEBAR_APP_ICON_GRADIENTS } from "@/config/sidebar";
import { useSession } from "@/lib/auth/auth-client";
import { cn } from "@/lib/utils";

export function SidebarProfileButton() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const isActive = pathname === "/profile";

  const name = session?.user?.name?.trim() || SETTINGS_DEFAULT_USER;
  const email = session?.user?.email?.trim();
  const initial = name.charAt(0).toUpperCase() || "W";

  return (
    <SidebarMenuItem>
      <div
        className={cn(
          SEPARATED_MENU_ITEM,
          "flex items-center gap-1 py-2 pr-1.5 pl-3",
          isActive &&
            "bg-sidebar-accent/50 font-medium text-sidebar-accent-foreground",
        )}
      >
        <Link
          href="/profile"
          aria-current={isActive ? "page" : undefined}
          className="flex min-w-0 flex-1 items-center gap-2 outline-none"
        >
          <span
            className={cn(
              "flex size-8 shrink-0 items-center justify-center rounded-full bg-linear-to-b text-xs font-semibold text-white shadow-sm",
              SIDEBAR_APP_ICON_GRADIENTS.brand,
            )}
          >
            {initial}
          </span>
          <div className="grid min-w-0 flex-1 text-left leading-tight">
            <span className="truncate font-medium">{name}</span>
            <span className="truncate text-xs text-muted-foreground">
              {email ?? APP_TAGLINE}
            </span>
          </div>
        </Link>
        <SidebarProfileMenu />
      </div>
    </SidebarMenuItem>
  );
}
