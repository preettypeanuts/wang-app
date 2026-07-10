import { MOBILE_SAFE_HORIZONTAL_INSET } from "@/config/ios-safe-area";
import { mobileOnly } from "@/config/mobile-layout";
import { MOBILE_LIQUID_GLASS_SURFACE } from "@/config/mobile-nav";
import {
  OVERVIEW_ROUTE,
  NOTIFICATIONS_ROUTE,
  PAYPLAN_ROUTE,
  PLANS_ROUTE,
  WISH_PAGE_TITLE,
} from "@/config/navigation";
import { NOTIFICATIONS_PAGE_TITLE } from "@/config/ui-labels";

/** Content clears fixed top bar on mobile. */
export const MOBILE_TOP_BAR_OFFSET = "var(--mobile-top-bar-offset)";

/** Content clears fixed bottom nav on mobile. */
export const MOBILE_BOTTOM_NAV_OFFSET = "var(--mobile-bottom-nav-offset)";

/**
 * Mobile scroll top — synced with Overview starting position (large title).
 * Keep in sync with config/overview.ts OVERVIEW_PAGE_SCROLL overrides.
 */
export const MOBILE_CHROME_SCROLL_INSET_TOP = [
  "max-md:pt-[calc(var(--mobile-safe-top)+4.75rem)]",
  "max-md:scroll-pt-[calc(var(--mobile-safe-top)+1.75rem)]",
].join(" ");

/** Horizontal inset for mobile page scroll — gutter + landscape notch. */
export const MOBILE_PAGE_SCROLL_INSET_X = [
  "max-md:pl-[calc(0.75rem+var(--mobile-safe-left))]",
  "max-md:pr-[calc(0.75rem+var(--mobile-safe-right))]",
].join(" ");

/**
 * Extra gap above floating bottom nav — value lives in globals.css
 * `--mobile-chrome-scroll-bottom-bleed`.
 */
export const MOBILE_CHROME_SCROLL_BOTTOM_BLEED =
  "var(--mobile-chrome-scroll-bottom-bleed)";

/** Scroll padding for anchor/scroll snap — uses `--mobile-scroll-inset-bottom` in globals.css. */
export const MOBILE_CHROME_SCROLL_INSET_BOTTOM = [
  "max-md:scroll-pb-[var(--mobile-scroll-inset-bottom)]",
].join(" ");

/** Spacer at scroll content end — immune to max-md:p-0 on shells. */
export const MOBILE_SCROLL_BOTTOM_SPACER = "mobile-scroll-bottom-spacer";

export const MOBILE_CHROME_SCROLL_INSET = [
  MOBILE_CHROME_SCROLL_INSET_TOP,
  MOBILE_CHROME_SCROLL_INSET_BOTTOM,
].join(" ");

/** Scroll inset for fixed top bar without in-content large title (Inbox-style). */
export const MOBILE_FIXED_TOP_BAR_SCROLL_INSET = [
  "max-md:scroll-pt-[var(--mobile-top-bar-offset)]",
  "max-md:pt-[var(--mobile-top-bar-offset)]",
  MOBILE_CHROME_SCROLL_INSET_BOTTOM,
].join(" ");

/** Strip glass shell on mobile — transparent root so wallpaper shows under Dynamic Island. */
export const MOBILE_NATIVE_SHELL = [
  mobileOnly("rounded-none"),
  mobileOnly("border-0"),
  mobileOnly("bg-transparent"),
  mobileOnly("shadow-none"),
  mobileOnly("[backdrop-filter:none]"),
  mobileOnly("[-webkit-backdrop-filter:none]"),
].join(" ");

const MOBILE_PAGE_TITLES: Record<string, string> = {
  "/": "Inbox",
  [OVERVIEW_ROUTE]: "Overview",
  "/journal": "Journal",
  [PAYPLAN_ROUTE]: "PayPlan",
  [PLANS_ROUTE]: WISH_PAGE_TITLE,
  [NOTIFICATIONS_ROUTE]: NOTIFICATIONS_PAGE_TITLE,
};

export function getMobilePageTitle(pathname: string): string | null {
  const exact = MOBILE_PAGE_TITLES[pathname];
  if (exact) {
    return exact;
  }

  for (const [route, title] of Object.entries(MOBILE_PAGE_TITLES)) {
    if (route !== "/" && pathname.startsWith(route)) {
      return title;
    }
  }

  return null;
}

export function shouldShowMobileDrawerButton(pathname: string): boolean {
  return (
    pathname !== "/" &&
    pathname !== "/profile" &&
    pathname !== NOTIFICATIONS_ROUTE
  );
}

/** Secondary pages — back orb on the left of fixed top bar. */
export function shouldShowMobileTopBarBackButton(pathname: string): boolean {
  return pathname === NOTIFICATIONS_ROUTE;
}

/** @deprecated Inbox lives on the bottom nav orb. */
export function shouldShowMobileInboxButton(_pathname: string): boolean {
  return false;
}

/** Routes with dedicated fixed mobile chrome (Inbox, Profile). */
export function shouldHideMobileScrollChrome(pathname: string): boolean {
  return pathname === "/" || pathname === "/profile";
}

/** iOS large title — left-aligned, scrolls away on mobile. */
export const MOBILE_PAGE_TITLE_LARGE = [
  "md:hidden",
  "text-left",
  "text-[2.125rem] font-bold leading-tight tracking-tight text-foreground",
  "pb-2",
].join(" ");

/** @deprecated Use MOBILE_PAGE_TITLE_LARGE */
export const MOBILE_PAGE_TITLE = MOBILE_PAGE_TITLE_LARGE;

/** Compact centered title in fixed nav bar — iOS collapsed state. */
export const MOBILE_COMPACT_TITLE = [
  "pointer-events-none absolute inset-x-12 text-center",
  "text-[1.0625rem] font-semibold leading-tight tracking-tight text-foreground",
  "transition-opacity duration-200",
].join(" ");

/** Soft gradient + fading blur scrim — visible after scroll (see isMobileTopBlurActive). */
export const MOBILE_SCROLL_TOP_BLUR = [
  "pointer-events-none fixed inset-x-0 top-0 z-[29]",
  "opacity-0 transition-opacity duration-200",
  "h-28",
  "bg-linear-to-b from-background/30 via-background/10 to-transparent",
  "backdrop-blur-xs",
  "[-webkit-mask-image:linear-gradient(to_bottom,black_10%,transparent)]",
  "mask-[linear-gradient(to_bottom,black_35%,transparent)]",
  "md:hidden",
].join(" ");

/** @deprecated Title scrolls in page content — use MobilePageTitle. */
export const MOBILE_TOP_BAR_TITLE = MOBILE_PAGE_TITLE;

/** Fixed nav chrome — blur layer + compact title + actions. */
export const MOBILE_TOP_BAR_ROOT = [
  "pointer-events-none fixed inset-x-0 top-0 z-30",
  "md:hidden",
].join(" ");

export const MOBILE_TOP_BAR_ROW = [
  "relative flex w-full items-center justify-end",
  MOBILE_SAFE_HORIZONTAL_INSET,
  "pt-[var(--mobile-safe-top)]",
  "h-[calc(var(--mobile-safe-top)+var(--mobile-top-bar-height))]",
].join(" ");

/** Shared glass for top bar orbs and PayPlan Kalender/Budget tabs. */
export const MOBILE_TOP_BAR_GLASS_SURFACE = MOBILE_LIQUID_GLASS_SURFACE;

/** Floating top bar orbs — same glass as PayPlan segmented tabs. */
export const MOBILE_TOP_BAR_ORB_SURFACE = MOBILE_TOP_BAR_GLASS_SURFACE;

/** Floating glass orb — top bar actions (menu, shortcuts). */
export const MOBILE_TOP_BAR_ORB_BUTTON = [
  "pointer-events-auto flex size-11 shrink-0 items-center justify-center rounded-full",
  MOBILE_TOP_BAR_ORB_SURFACE,
  "text-foreground/90 transition-transform active:scale-95",
  "[&_svg]:size-[1.35rem]",
].join(" ");

/** @deprecated Use MOBILE_TOP_BAR_ORB_BUTTON */
export const MOBILE_TOP_BAR_INBOX_BUTTON = MOBILE_TOP_BAR_ORB_BUTTON;

/** Fixed thin progress line during background inbox sync on mobile. */
export const MOBILE_TAB_REFRESH_BAR = [
  "pointer-events-none fixed inset-x-0 top-0 z-[31]",
  "md:hidden",
].join(" ");

export const MOBILE_TAB_REFRESH_BAR_FILL = "mobile-tab-refresh-bar-fill";
