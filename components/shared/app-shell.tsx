"use client";

import { AppearanceProvider } from "@/components/shared/appearance-provider";
import { AppSidebar } from "@/components/shared/app-sidebar";
import { WallpaperBackground } from "@/components/shared/wallpaper-background";
import { WallpaperProvider } from "@/components/shared/wallpaper-provider";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { SEPARATED_SIDEBAR_ICON_WIDTH } from "@/config/sidebar";

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <AppearanceProvider>
      <WallpaperProvider>
        <WallpaperBackground />
        <SidebarProvider
          className="relative z-10 h-svh max-h-svh overflow-hidden bg-transparent"
          style={
            {
              "--sidebar-width-icon": SEPARATED_SIDEBAR_ICON_WIDTH,
            } as React.CSSProperties
          }
        >
          <AppSidebar />
          <SidebarInset className="min-h-0 overflow-hidden bg-transparent">
            <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
              {children}
            </div>
          </SidebarInset>
        </SidebarProvider>
      </WallpaperProvider>
    </AppearanceProvider>
  );
}
