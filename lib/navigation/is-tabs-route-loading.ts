import { isValidElement, type ReactNode } from "react";

import { TabsRouteLoading } from "@/components/shared/tabs-route-loading";

export function isTabsRouteLoading(node: ReactNode): boolean {
  if (!isValidElement(node)) {
    return false;
  }

  if (node.type === TabsRouteLoading) {
    return true;
  }

  const props = node.props as { "data-slot"?: string };
  return props["data-slot"] === "tabs-route-loading";
}
