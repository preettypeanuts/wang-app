"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { SidebarBrandButton } from "@/components/shared/sidebar-brand-button";
import { SidebarCollapseTrigger } from "@/components/shared/sidebar-collapse-trigger";
import { SidebarSettingsButton } from "@/components/shared/sidebar-settings-button";
import {
  SEPARATED_MENU_ITEM,
  SEPARATED_SIDEBAR_CLASS,
  SEPARATED_SIDEBAR_GUTTER,
} from "@/config/sidebar";
import { mainNavItems } from "@/config/navigation";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar
      variant="floating"
      collapsible="icon"
      className={cn(SEPARATED_SIDEBAR_CLASS, "group/sidebar", SEPARATED_SIDEBAR_GUTTER)}
    >
      <SidebarHeader className="gap-2 p-2 group-data-[collapsible=icon]:items-center">
        <div className="flex w-full items-center gap-1.5 group-data-[collapsible=icon]:w-auto group-data-[collapsible=icon]:justify-center">
          <SidebarMenu className="min-w-0 flex-1 group-data-[collapsible=icon]:flex-none">
            <SidebarMenuItem className="group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:justify-center">
              <SidebarBrandButton />
            </SidebarMenuItem>
          </SidebarMenu>
          <SidebarCollapseTrigger className="group-data-[collapsible=icon]:hidden" />
        </div>
        <SidebarCollapseTrigger className="hidden group-data-[collapsible=icon]:flex" />
      </SidebarHeader>
      <SidebarContent className="group-data-[collapsible=icon]:items-center">
        <SidebarGroup className="group-data-[collapsible=icon]:w-full group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:px-1">
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent className="group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:flex-col group-data-[collapsible=icon]:items-center">
            <SidebarMenu className="group-data-[collapsible=icon]:items-center">
              {mainNavItems.map((item) => (
                <SidebarMenuItem
                  key={item.href}
                  className="group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:justify-center"
                >
                  <SidebarMenuButton
                    render={<Link href={item.href} />}
                    isActive={pathname === item.href}
                    tooltip={item.title}
                    className={SEPARATED_MENU_ITEM}
                  >
                    <item.icon />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-2 group-data-[collapsible=icon]:items-center">
        <SidebarMenu className="group-data-[collapsible=icon]:items-center">
          <SidebarSettingsButton />
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
