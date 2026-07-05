import { CalendarBlankIcon, NotebookIcon, TrayIcon, type Icon } from "@phosphor-icons/react";

export const PAYPLAN_ROUTE = "/payplan";

export interface NavItem {
  title: string;
  href: string;
  icon: Icon;
}

export const mainNavItems: NavItem[] = [
  {
    title: "Inbox",
    href: "/",
    icon: TrayIcon,
  },
  {
    title: "Journal",
    href: "/journal",
    icon: NotebookIcon,
  },
  {
    title: "PayPlan",
    href: PAYPLAN_ROUTE,
    icon: CalendarBlankIcon,
  },
];
