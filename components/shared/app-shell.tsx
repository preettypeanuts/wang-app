"use client";

import { usePathname } from "next/navigation";

import { AppContentSurface } from "@/components/shared/app-content-surface";
import { DesktopAppSidebar } from "@/components/shared/desktop-app-sidebar";
import { FixedViewportPortal } from "@/components/shared/fixed-viewport-portal";
import { MobileBottomNav } from "@/components/shared/mobile-bottom-nav";
import { NotificationBannerStack } from "@/components/notifications/notification-banner-stack";
import { InboxBootstrapPrefetch } from "@/components/inbox/inbox-bootstrap-prefetch";
import { PushNotificationManager } from "@/components/shared/push-notification-manager";
import { MobileScrollChrome } from "@/components/shared/mobile-scroll-chrome";
import { MobileScrollChromeProvider } from "@/components/shared/mobile-scroll-chrome-provider";
import { MobileTopBlurLayer } from "@/components/shared/mobile-top-blur-layer";
import { MobileTopBlurProvider } from "@/components/shared/mobile-top-blur-provider";
import { PersistentSidebarProvider } from "@/components/shared/persistent-sidebar-provider";
import { PwaHtmlBackgroundSync } from "@/components/shared/pwa-html-background-sync";
import { PwaStandaloneViewportFix } from "@/components/shared/pwa-standalone-viewport-fix";
import { PwaStatusBarFix } from "@/components/shared/pwa-status-bar-fix";
import { WallpaperBackground } from "@/components/shared/wallpaper-background";
import { WallpaperProvider } from "@/components/shared/wallpaper-provider";
import { SidebarInset } from "@/components/ui/sidebar";
import { MOBILE_AUTH_SAFE_INSET } from "@/config/ios-safe-area";
import { usesCustomDesktopPageShell } from "@/config/page-surface";
import { SEPARATED_SIDEBAR_ICON_WIDTH } from "@/config/sidebar";
import { DESKTOP_OUTER_GUTTER, DESKTOP_OUTER_GUTTER_X } from "@/config/spacing";
import { cn } from "@/lib/utils";

interface AppShellProps {
  children: React.ReactNode;
  initialSidebarOpen: boolean;
}

export function AppShell({
  children,
  initialSidebarOpen,
}: AppShellProps) {
  const pathname = usePathname();
  const isAuthRoute = pathname === "/login" || pathname === "/register";
  const customDesktopPageShell = usesCustomDesktopPageShell(pathname);

  return (
    <WallpaperProvider>
      <FixedViewportPortal>
        <WallpaperBackground />
      </FixedViewportPortal>
      <PwaHtmlBackgroundSync />
      <PwaStatusBarFix />
      <PwaStandaloneViewportFix />
      <PushNotificationManager />
      <InboxBootstrapPrefetch />
      <div className="relative flex h-full min-h-0 flex-1 flex-col overflow-hidden">
        {isAuthRoute ? (
          <div
            className={cn(
              "relative z-10 min-h-0 flex-1 overflow-y-auto",
              MOBILE_AUTH_SAFE_INSET,
            )}
          >
            {children}
          </div>
        ) : (
          <PersistentSidebarProvider
            initialOpen={initialSidebarOpen}
            className="relative z-10 h-full min-h-0 flex-1 overflow-hidden bg-transparent md:min-h-svh"
            style={
              {
                "--sidebar-width-icon": SEPARATED_SIDEBAR_ICON_WIDTH,
              } as React.CSSProperties
            }
          >
            <DesktopAppSidebar />
            <SidebarInset
              className={cn(
                "min-h-0 flex-1 overflow-hidden bg-transparent",
                customDesktopPageShell
                  ? DESKTOP_OUTER_GUTTER_X
                  : DESKTOP_OUTER_GUTTER,
              )}
            >
              <MobileScrollChromeProvider>
                <MobileTopBlurProvider>
                  <FixedViewportPortal>
                    <MobileTopBlurLayer />
                    <MobileScrollChrome />
                  </FixedViewportPortal>
                  <AppContentSurface>{children}</AppContentSurface>
                </MobileTopBlurProvider>
              </MobileScrollChromeProvider>
            </SidebarInset>
            <FixedViewportPortal>
              <MobileBottomNav />
              <NotificationBannerStack />
            </FixedViewportPortal>
          </PersistentSidebarProvider>
        )}
      </div>
    </WallpaperProvider>
  );
}
