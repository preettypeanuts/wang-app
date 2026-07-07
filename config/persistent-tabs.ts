import {
  OVERVIEW_ROUTE,
  PAYPLAN_ROUTE,
  PLANS_ROUTE,
} from "@/config/navigation";

/** Bottom-nav destinations kept mounted on mobile for instant tab switches. */
export const PERSISTENT_MOBILE_TAB_ROUTES = [
  "/",
  OVERVIEW_ROUTE,
  PLANS_ROUTE,
  "/journal",
  PAYPLAN_ROUTE,
] as const;

export type PersistentMobileTabRoute =
  (typeof PERSISTENT_MOBILE_TAB_ROUTES)[number];

const PERSISTENT_MOBILE_TAB_ROUTE_SET = new Set<string>(
  PERSISTENT_MOBILE_TAB_ROUTES,
);

export function isPersistentMobileTabRoute(
  pathname: string,
): pathname is PersistentMobileTabRoute {
  return PERSISTENT_MOBILE_TAB_ROUTE_SET.has(pathname);
}
