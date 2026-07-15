import { MOBILE_BOTTOM_DRAWER_POPUP } from "@/config/mobile-layout";
import {
  mainNavItems,
  type NavItem,
  NOTIFICATIONS_ROUTE,
  OVERVIEW_ROUTE,
  PAYPLAN_ROUTE,
  PLANS_ROUTE,
  WALLETS_ROUTE,
} from "@/config/navigation";
import { SIDEBAR_APP_ICON_GRADIENTS } from "@/config/sidebar";
import { GRID_GAP } from "@/config/spacing";
import { NOTIFICATIONS_PAGE_TITLE } from "@/config/ui-labels";
import type { Icon } from "@/lib/icons";
import { HomeNavIcon } from "@/components/shared/home-nav-icon";
import {
  BellIcon,
  ChartBarIcon,
  MobileNavInboxIcon,
  MobileNavJournalIcon,
  MobileNavPayPlanIcon,
  MobileNavWishIcon,
  WalletIcon,
} from "@/lib/icons";

/** Safe-area bottom inset — shared by nav bar & drawer anchor. */
export const MOBILE_BOTTOM_NAV_SAFE_BOTTOM =
  "var(--mobile-bottom-nav-safe-bottom)";

/** Nav cluster height (`min-h-15` / `size-15`). */
export const MOBILE_NAV_BAR_HEIGHT = "var(--mobile-nav-bar-height)";

/** Drawer bottom inset from screen edge — sync with globals.css */
export const MOBILE_DRAWER_BOTTOM = "var(--mobile-drawer-bottom)";

/** Horizontal gutter — sync with `--mobile-chrome-gutter` in globals.css */
export const MOBILE_CHROME_GUTTER = "var(--mobile-chrome-gutter)";

/** Content / floating controls clear this on mobile. */
export const MOBILE_BOTTOM_NAV_OFFSET = "var(--mobile-bottom-nav-offset)";

/** iOS 26 liquid glass — frosted pill + menu orb. */
export const MOBILE_LIQUID_GLASS_SURFACE =
  "border border-white/28 bg-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.16),inset_0_1px_0_0_rgba(255,255,255,0.48)] backdrop-blur-sm backdrop-saturate-150 dark:border-white/12 dark:bg-black/20 dark:shadow-[0_8px_32px_rgba(0,0,0,0.38),inset_0_1px_0_0_rgba(255,255,255,0.1)]";

/** Horizontal inset — gutter + landscape notch safe area. */
export const MOBILE_BOTTOM_NAV_INSET_X = [
  "pl-[calc(var(--mobile-chrome-gutter)+var(--mobile-safe-left))]",
  "pr-[calc(var(--mobile-chrome-gutter)+var(--mobile-safe-right))]",
].join(" ");

/** Gap between primary pill and drawer orb — sync with GRID_GAP. */
export const MOBILE_BOTTOM_NAV_CLUSTER_GAP = GRID_GAP;

export const MOBILE_BOTTOM_NAV_ROOT = `pointer-events-none fixed inset-x-0 bottom-0 z-40 flex w-full ${MOBILE_BOTTOM_NAV_INSET_X} pb-[var(--mobile-bottom-nav-safe-bottom)] md:hidden`;

export const MOBILE_BOTTOM_NAV_PILL =
  "pointer-events-auto flex min-h-15 min-w-0 flex-1 items-stretch rounded-full p-0.5";

export const MOBILE_BOTTOM_NAV_ITEM =
  "relative flex min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-full py-1.5 text-[10px] font-medium leading-none transition-colors";

export const MOBILE_BOTTOM_NAV_ITEM_WRAPPER = "flex min-w-0 flex-1";

export const MOBILE_BOTTOM_NAV_GLYPH = "relative z-[1] size-6";

export const MOBILE_BOTTOM_NAV_GLYPH_ACTIVE =
  "relative z-[1] size-6 text-primary";

export const MOBILE_BOTTOM_NAV_LABEL =
  "relative z-[1] max-w-full truncate px-0.5";

export const MOBILE_BOTTOM_NAV_LABEL_ACTIVE = "text-primary";

export const MOBILE_BOTTOM_NAV_ITEM_ACTIVE = "text-foreground dark:text-white";

export const MOBILE_BOTTOM_NAV_ITEM_IDLE =
  "text-foreground/75 hover:text-foreground/95 dark:text-white/72 dark:hover:text-white/90";

export const MOBILE_BOTTOM_NAV_ACTIVE_ORB =
  "absolute inset-0 rounded-full bg-neutral-400/20 dark:bg-white/18";

/** Perfect circle — height matches pill (`min-h-15`). */
export const MOBILE_BOTTOM_NAV_MENU_BUTTON =
  "pointer-events-auto relative flex size-15 shrink-0 items-center justify-center rounded-full p-0 text-foreground/80 transition-colors hover:text-foreground dark:text-white/80 dark:hover:text-white";

/** Floating + — right edge aligns with bottom nav cluster (menu orb). */
export const MOBILE_ADD_FAB = [
  "pointer-events-auto fixed z-30 md:hidden",
  "right-[calc(var(--mobile-chrome-gutter)+var(--mobile-safe-right))]",
  "bottom-[calc(var(--mobile-bottom-nav-offset)+0.5rem)]",
  "flex size-12 items-center justify-center rounded-full",
  "bg-primary text-primary-foreground",
  "shadow-[0_6px_22px_rgba(0,0,0,0.2)]",
  "transition-transform active:scale-95",
].join(" ");

export const MOBILE_ADD_FAB_ICON = "size-5";

export const MOBILE_DRAWER_ROW =
  "flex items-center gap-3 rounded-2xl bg-muted/60 px-3 py-2.5 text-sm font-medium text-foreground transition-colors active:bg-muted";

export const MOBILE_DRAWER_TILE =
  "flex size-8 shrink-0 items-center justify-center rounded-[0.6rem] bg-linear-to-b text-white [&_svg]:size-[18px]";

/** Sync with `.mobile-bottom-drawer-popup` in globals.css — layout only. */
export const MOBILE_DRAWER_POPUP = MOBILE_BOTTOM_DRAWER_POPUP;

export const MOBILE_DRAWER_SURFACE = [
  MOBILE_DRAWER_POPUP,
  "mt-0! gap-0 border border-neutral-400/30 bg-popover/40 px-4 pt-0 backdrop-blur-2xl dark:border-neutral-600/30",
].join(" ");

/** Footer — shrink-0, tidak ikut scroll area. */
export const MOBILE_DRAWER_FOOTER =
  "mt-2 shrink-0 space-y-2 border-t border-border/60 pt-2";

/** Scroll area untuk nav items drawer. */
export const MOBILE_DRAWER_SCROLL =
  "mobile-nav-drawer-scroll min-h-0 flex-1 space-y-2 overflow-y-auto overscroll-contain";

export const MOBILE_DRAWER_LOGOUT_ROW = [
  MOBILE_DRAWER_ROW,
  "text-destructive hover:text-destructive",
].join(" ");

export interface MobileDrawerMenuItem {
  id: string;
  title: string;
  href: string;
  icon: Icon;
  drawerTileClass: string;
}

/** Quick links in menu drawer — not on bottom pill. */
export const MOBILE_DRAWER_MENU_LABEL = "Menu";

export const mobileDrawerMenuItems: MobileDrawerMenuItem[] = [
  {
    id: "notifications",
    title: NOTIFICATIONS_PAGE_TITLE,
    href: NOTIFICATIONS_ROUTE,
    icon: BellIcon,
    drawerTileClass: SIDEBAR_APP_ICON_GRADIENTS.notifications,
  },
  {
    id: "budget",
    title: "Budget",
    href: `${PAYPLAN_ROUTE}?tab=budget`,
    icon: ChartBarIcon,
    drawerTileClass: SIDEBAR_APP_ICON_GRADIENTS.payplan,
  },
  {
    id: "wallets",
    title: "Wallets",
    href: WALLETS_ROUTE,
    icon: WalletIcon,
    drawerTileClass: SIDEBAR_APP_ICON_GRADIENTS.wallets,
  },
];

const MOBILE_PRIMARY_HREFS = [
  OVERVIEW_ROUTE,
  PLANS_ROUTE,
  "/journal",
  PAYPLAN_ROUTE,
  "/",
] as const;

export interface MobileBottomNavItem {
  title: string;
  href: string;
  icon: Icon;
}

const MOBILE_BOTTOM_NAV_ICON_BY_HREF: Record<string, Icon> = {
  [OVERVIEW_ROUTE]: HomeNavIcon,
  [PLANS_ROUTE]: MobileNavWishIcon,
  "/journal": MobileNavJournalIcon,
  [PAYPLAN_ROUTE]: MobileNavPayPlanIcon,
  "/": MobileNavInboxIcon,
};

function findNavItem(href: string): NavItem {
  const item = mainNavItems.find((entry) => entry.href === href);
  if (!item) {
    throw new Error(`Missing nav item for href: ${href}`);
  }

  return item;
}

export const mobileBottomNavItems: MobileBottomNavItem[] =
  MOBILE_PRIMARY_HREFS.map((href) => {
    const item = findNavItem(href);
    const icon = MOBILE_BOTTOM_NAV_ICON_BY_HREF[href];

    if (!icon) {
      throw new Error(`Missing mobile nav icon for href: ${href}`);
    }

    return {
      title: item.title,
      href: item.href,
      icon,
    };
  });

export function isDrawerMenuItemActive(
  pathname: string,
  tab: string | null,
  item: MobileDrawerMenuItem,
): boolean {
  if (item.id === "budget") {
    return pathname === PAYPLAN_ROUTE && tab === "budget";
  }

  if (item.id === "notifications") {
    return pathname === NOTIFICATIONS_ROUTE;
  }

  if (item.id === "wallets") {
    return pathname === WALLETS_ROUTE;
  }

  return isNavItemActive(pathname, item.href);
}

export function isNavItemActive(pathname: string, href: string): boolean {
  if (href === "/") {
    return pathname === "/";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

/** Secondary pages — no bottom pill (back via top bar / drawer). */
export function shouldHideMobileBottomNav(pathname: string): boolean {
  return pathname === NOTIFICATIONS_ROUTE || pathname === "/profile";
}
