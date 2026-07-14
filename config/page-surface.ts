import {
  NOTIFICATIONS_ROUTE,
  OVERVIEW_ROUTE,
  WALLETS_ROUTE,
} from "@/config/navigation";

/** Routes with wallpaper visible (Inbox + Overview + Notifications on mobile). */
const WALLPAPER_ROUTES = ["/", OVERVIEW_ROUTE, NOTIFICATIONS_ROUTE] as const;

/** Overview sub-pages that use solid mobile background (Wish/Journal style). */
const SOLID_OVERVIEW_SUB_ROUTES = [WALLETS_ROUTE] as const;

export function isWallpaperRoute(pathname: string): boolean {
  if (
    SOLID_OVERVIEW_SUB_ROUTES.some(
      (route) => pathname === route || pathname.startsWith(`${route}/`),
    )
  ) {
    return false;
  }

  return WALLPAPER_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
}

/** Inbox + Overview manage desktop gutter in their own page shells. */
export function usesCustomDesktopPageShell(pathname: string): boolean {
  return isWallpaperRoute(pathname);
}

/** Solid theme background — mobile only (Wish, Journal, PayPlan). */
export const MOBILE_SOLID_PAGE_ROOT = "max-md:bg-background";
