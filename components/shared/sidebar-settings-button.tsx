"use client";

import { GearSixIcon } from "@/lib/icons";

import { SettingsSheet } from "@/components/shared/settings-sheet";
import { SidebarAppIcon } from "@/components/shared/sidebar-app-icon";
import {
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { SETTINGS_TITLE } from "@/config/settings-labels";
import {
  SEPARATED_MENU_ITEM,
  SIDEBAR_APP_ICON_GRADIENTS,
} from "@/config/sidebar";
import { cn } from "@/lib/utils";

export function SidebarSettingsButton() {
  return (
    <SidebarMenuItem className="group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:justify-center">
      <SettingsSheet
        trigger={
          <SidebarMenuButton
            tooltip={SETTINGS_TITLE}
            className={cn(
              SEPARATED_MENU_ITEM,
              "group-data-[collapsible=icon]:size-9! group-data-[collapsible=icon]:rounded-[0.7rem]! group-data-[collapsible=icon]:bg-transparent! group-data-[collapsible=icon]:p-0! group-data-[collapsible=icon]:hover:bg-transparent!",
            )}
          >
            <SidebarAppIcon
              icon={GearSixIcon}
              gradient={SIDEBAR_APP_ICON_GRADIENTS.settings}
            />
            <span>{SETTINGS_TITLE}</span>
          </SidebarMenuButton>
        }
      />
    </SidebarMenuItem>
  );
}
