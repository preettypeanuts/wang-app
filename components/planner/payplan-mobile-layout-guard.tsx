"use client";

import { useEffect } from "react";

import { usePayplanPageTab } from "@/components/planner/payplan-page-tab-context";
import { useIsMobileViewport } from "@/hooks/use-is-mobile-viewport";
import { syncPayplanTabUrl } from "@/lib/payplan/payplan-tab-store";
import type { PlannerCalendarLayout } from "@/types/planner";

/** Mobile combines calendar + list — strip manage layout from URL without RSC navigation. */
export function PayplanMobileLayoutGuard({
  layout,
  monthKey,
}: {
  layout: PlannerCalendarLayout;
  monthKey: string;
}) {
  const isMobile = useIsMobileViewport();
  const tabContext = usePayplanPageTab();
  const tab = tabContext?.tab ?? "calendar";

  useEffect(() => {
    if (!isMobile || layout === "month" || tab === "budget") {
      return;
    }

    syncPayplanTabUrl("calendar", monthKey, { stripLayout: true });
  }, [isMobile, layout, monthKey, tab]);

  return null;
}
