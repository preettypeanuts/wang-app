"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { SidebarAppIcon } from "@/components/shared/sidebar-app-icon";
import { SidebarBrandButton } from "@/components/shared/sidebar-brand-button";
import { SidebarCollapsedDock } from "@/components/shared/sidebar-collapsed-dock";
import { SidebarCollapseTrigger } from "@/components/shared/sidebar-collapse-trigger";
import { SidebarProfileButton } from "@/components/shared/sidebar-profile-button";
import { SidebarSettingsButton } from "@/components/shared/sidebar-settings-button";
import {
  SEPARATED_MENU_ITEM,
  SEPARATED_SIDEBAR_CLASS,
  SEPARATED_SIDEBAR_GUTTER,
} from "@/config/sidebar";
import { mainNavItems, utilityNavItems } from "@/config/navigation";
import { warmRouteDataOnHover } from "@/lib/navigation/warm-route-data";
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
  useSidebar,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

export function AppSidebar() {
  const pathname = usePathname();
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  return (
    <Sidebar
      variant="floating"
      collapsible="icon"
      className={cn(SEPARATED_SIDEBAR_CLASS, "group/sidebar", SEPARATED_SIDEBAR_GUTTER)}
    >
      {isCollapsed ? (
        <div className="flex w-full justify-center">
          <SidebarCollapsedDock />
        </div>
      ) : (
        <>
          <SidebarHeader className="gap-2 p-0">
            <div className="flex w-full items-center gap-1.5">
              <SidebarMenu className="min-w-0 flex-1">
                <SidebarMenuItem>
                  <SidebarBrandButton />
                </SidebarMenuItem>
              </SidebarMenu>
              <SidebarCollapseTrigger />
            </div>
          </SidebarHeader>
          <SidebarContent className="gap-0 p-0">
            <SidebarGroup className="p-0">
              <SidebarGroupLabel>Menu</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu className="gap-1">
                  {mainNavItems.map((item) => (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                        render={
                          <Link
                            href={item.href}
                            onMouseEnter={() => warmRouteDataOnHover(item.href)}
                          />
                        }
                        isActive={pathname === item.href}
                        tooltip={item.title}
                        className={SEPARATED_MENU_ITEM}
                      >
                        <SidebarAppIcon
                          icon={item.icon}
                          gradient={item.gradient}
                          isActive={pathname === item.href}
                        />
                        <span>{item.title}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                  {utilityNavItems.map((item) => (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                        render={
                          <Link
                            href={item.href}
                            onMouseEnter={() => warmRouteDataOnHover(item.href)}
                          />
                        }
                        isActive={pathname === item.href}
                        tooltip={item.title}
                        className={SEPARATED_MENU_ITEM}
                      >
                        <SidebarAppIcon
                          icon={item.icon}
                          gradient={item.gradient}
                          isActive={pathname === item.href}
                        />
                        <span>{item.title}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                  <SidebarSettingsButton />
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter className="gap-0 p-0">
            <SidebarMenu>
              <SidebarProfileButton />
            </SidebarMenu>
          </SidebarFooter>
        </>
      )}
    </Sidebar>
  );
}
