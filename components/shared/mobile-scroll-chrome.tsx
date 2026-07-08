"use client";

import { usePathname } from "next/navigation";
import { Suspense } from "react";

import { PlannerMobileTopBarTabs } from "@/components/planner/planner-mobile-top-bar-tabs";
import { PlansMobileTopBarTabs } from "@/components/plans/plans-mobile-top-bar-tabs";
import { useMobileScrollChromeSnapshot } from "@/components/shared/mobile-scroll-chrome-provider";
import { MobileTopBarBackButton } from "@/components/shared/mobile-top-bar-back-button";
import { MobileTopBarDrawerButton } from "@/components/shared/mobile-top-bar-drawer-button";
import {
  MOBILE_COMPACT_TITLE,
  MOBILE_TOP_BAR_ROOT,
  MOBILE_TOP_BAR_ROW,
  shouldHideMobileScrollChrome,
  shouldShowMobileDrawerButton,
  shouldShowMobileTopBarBackButton,
} from "@/config/mobile-chrome";
import { PAYPLAN_ROUTE, PLANS_ROUTE } from "@/config/navigation";
import { PAYPLAN_TOP_BAR_ACTIONS } from "@/config/payplan-mobile";
import { cn } from "@/lib/utils";

export function MobileScrollChrome() {
  const pathname = usePathname();
  const snapshot = useMobileScrollChromeSnapshot();
  const showBack = shouldShowMobileTopBarBackButton(pathname);
  const showDrawer = shouldShowMobileDrawerButton(pathname);
  const showPayplanTabs = pathname === PAYPLAN_ROUTE || pathname.startsWith(`${PAYPLAN_ROUTE}/`);
  const showPlansTabs = pathname === PLANS_ROUTE || pathname.startsWith(`${PLANS_ROUTE}/`);

  if (shouldHideMobileScrollChrome(pathname)) {
    return null;
  }

  if (!snapshot && !showDrawer && !showPayplanTabs && !showPlansTabs && !showBack) {
    return null;
  }

  const showCompactTitle = snapshot?.showCompactTitle ?? false;

  return (
    <>
      <header className={MOBILE_TOP_BAR_ROOT}>
        <div
          className={cn(
            MOBILE_TOP_BAR_ROW,
            showBack && "justify-between",
          )}
        >
          {showBack ? <MobileTopBarBackButton /> : null}
          {snapshot?.title ? (
            <p
              aria-hidden={!showCompactTitle}
              className={cn(
                MOBILE_COMPACT_TITLE,
                showCompactTitle ? "opacity-100" : "opacity-0",
              )}
            >
              {snapshot.title}
            </p>
          ) : null}
          {showPayplanTabs || showPlansTabs || showDrawer ? (
            <div className={PAYPLAN_TOP_BAR_ACTIONS}>
              {showPayplanTabs ? (
                <Suspense fallback={null}>
                  <PlannerMobileTopBarTabs />
                </Suspense>
              ) : null}
              {showPlansTabs ? (
                <Suspense fallback={null}>
                  <PlansMobileTopBarTabs />
                </Suspense>
              ) : null}
              {showDrawer ? <MobileTopBarDrawerButton /> : null}
            </div>
          ) : showBack ? (
            <span aria-hidden className="size-11 shrink-0" />
          ) : null}
        </div>
      </header>
    </>
  );
}
