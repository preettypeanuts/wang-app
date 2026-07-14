import { OVERVIEW_ROUTE, NOTIFICATIONS_ROUTE } from "@/config/navigation";

/** Routes with wallpaper visible (Inbox + Overview + Notifications on mobile). */
const WALLPAPER_ROUTES = ["/", OVERVIEW_ROUTE, NOTIFICATIONS_ROUTE] as const;

export function isWallpaperRoute(pathname: string): boolean {
  return WALLPAPER_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
}

/** Inbox + Overview manage desktop gutter in their own page shells. */
export function usesCustomDesktopPageShell(pathname: string): boolean {
  return isWallpaperRoute(pathname);
}

/** Solid theme background — mobile only (Wish, Journal, PayPlan, Wallets). */
export const MOBILE_SOLID_PAGE_ROOT = "max-md:bg-background";
