import {
  OVERVIEW_ROUTE,
  PAYPLAN_ROUTE,
  PLANS_ROUTE,
} from "@/config/navigation";

/** Main nav destinations kept mounted for instant tab switches (mobile + desktop). */
export const PERSISTENT_TAB_ROUTES = [
  "/",
  OVERVIEW_ROUTE,
  PLANS_ROUTE,
  "/journal",
  PAYPLAN_ROUTE,
] as const;

/** @deprecated Use PERSISTENT_TAB_ROUTES */
export const PERSISTENT_MOBILE_TAB_ROUTES = PERSISTENT_TAB_ROUTES;

export type PersistentTabRoute = (typeof PERSISTENT_TAB_ROUTES)[number];

/** @deprecated Use PersistentTabRoute */
export type PersistentMobileTabRoute = PersistentTabRoute;

const PERSISTENT_TAB_ROUTE_SET = new Set<string>(PERSISTENT_TAB_ROUTES);

export function isPersistentTabRoute(
  pathname: string,
): pathname is PersistentTabRoute {
  return PERSISTENT_TAB_ROUTE_SET.has(pathname);
}

/** @deprecated Use isPersistentTabRoute */
export const isPersistentMobileTabRoute = isPersistentTabRoute;
