import {
  CalendarBlankIcon,
  ChatIcon,
  BellIcon,
  HeartIcon,
  NotebookIcon,
  SquaresFourIcon,
  type Icon,
} from "@/lib/icons";

import {
  SIDEBAR_APP_ICON_GRADIENTS,
  type SidebarAppIconGradient,
} from "@/config/sidebar";
import { NOTIFICATIONS_PAGE_TITLE } from "@/config/ui-labels";

export const OVERVIEW_ROUTE = "/overview";
export const WALLETS_ROUTE = "/wallets";
export const PAYPLAN_ROUTE = "/payplan";
export const PLANS_ROUTE = "/plans";
export const NOTIFICATIONS_ROUTE = "/notifications";

/** User-facing page title for `/plans` — internal route unchanged. */
export const WISH_PAGE_TITLE = "Wish";
export const SAVINGS_PAGE_TITLE = "Savings";

export interface NavItem {
  title: string;
  href: string;
  icon: Icon;
  gradient: SidebarAppIconGradient;
}

export const mainNavItems: NavItem[] = [
  {
    title: "Overview",
    href: OVERVIEW_ROUTE,
    icon: SquaresFourIcon,
    gradient: SIDEBAR_APP_ICON_GRADIENTS.overview,
  },
  {
    title: "Inbox",
    href: "/",
    icon: ChatIcon,
    gradient: SIDEBAR_APP_ICON_GRADIENTS.inbox,
  },
  {
    title: "Journal",
    href: "/journal",
    icon: NotebookIcon,
    gradient: SIDEBAR_APP_ICON_GRADIENTS.journal,
  },
  {
    title: "PayPlan",
    href: PAYPLAN_ROUTE,
    icon: CalendarBlankIcon,
    gradient: SIDEBAR_APP_ICON_GRADIENTS.payplan,
  },
  {
    title: WISH_PAGE_TITLE,
    href: PLANS_ROUTE,
    icon: HeartIcon,
    gradient: SIDEBAR_APP_ICON_GRADIENTS.plans,
  },
];

export const utilityNavItems: NavItem[] = [
  {
    title: NOTIFICATIONS_PAGE_TITLE,
    href: NOTIFICATIONS_ROUTE,
    icon: BellIcon,
    gradient: SIDEBAR_APP_ICON_GRADIENTS.notifications,
  },
];
