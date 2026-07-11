"use client";

import Link from "next/link";
import { SidebarAppLogo } from "@/components/shared/sidebar-app-logo";
import { SidebarMenuButton } from "@/components/ui/sidebar";
import { APP_NAME, APP_TAGLINE } from "@/config/app";
import {
  SEPARATED_MENU_ITEM,
  SIDEBAR_APP_LOGO_DOCK_IMAGE_SIZE,
  SIDEBAR_APP_LOGO_DOCK_INSET,
  SIDEBAR_APP_LOGO_DOCK_SHELL,
} from "@/config/sidebar";
import { cn } from "@/lib/utils";

interface SidebarBrandButtonProps {
  className?: string;
}

export function SidebarBrandButton({ className }: SidebarBrandButtonProps) {
  return (
    <SidebarMenuButton
      size="lg"
      className={cn(
        SEPARATED_MENU_ITEM,
        "group-data-[collapsible=icon]:size-9! group-data-[collapsible=icon]:rounded-[0.7rem]! group-data-[collapsible=icon]:bg-transparent! group-data-[collapsible=icon]:p-0! group-data-[collapsible=icon]:hover:bg-transparent!",
        className,
      )}
      render={<Link href="/" />}
    >
      <SidebarAppLogo
        className={cn(SIDEBAR_APP_LOGO_DOCK_SHELL, SIDEBAR_APP_LOGO_DOCK_INSET)}
        size={SIDEBAR_APP_LOGO_DOCK_IMAGE_SIZE}
      />
      <div className="grid min-w-0 flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
        <span className="truncate font-semibold">{APP_NAME}</span>
        <span className="truncate text-xs text-muted-foreground">
          {APP_TAGLINE}
        </span>
      </div>
    </SidebarMenuButton>
  );
}
