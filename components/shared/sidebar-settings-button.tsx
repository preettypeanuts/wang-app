"use client";

import { GearSixIcon } from "@/lib/icons";

import { SettingsSheet } from "@/components/shared/settings-sheet";
import {
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { SEPARATED_MENU_ITEM } from "@/config/sidebar";

export function SidebarSettingsButton() {
  return (
    <SidebarMenuItem className="group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:justify-center">
      <SettingsSheet
        trigger={
          <SidebarMenuButton
            tooltip="Pengaturan"
            className={SEPARATED_MENU_ITEM}
          >
            <GearSixIcon />
            <span>Pengaturan</span>
          </SidebarMenuButton>
        }
      />
    </SidebarMenuItem>
  );
}
