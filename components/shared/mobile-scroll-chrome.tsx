"use client";

import { usePathname } from "next/navigation";
import { Suspense } from "react";

import { PlannerMobileTopBarTabs } from "@/components/planner/planner-mobile-top-bar-tabs";
import { useMobileScrollChromeSnapshot } from "@/components/shared/mobile-scroll-chrome-provider";
import { MobileTopBarDrawerButton } from "@/components/shared/mobile-top-bar-drawer-button";
import {
  MOBILE_COMPACT_TITLE,
  MOBILE_SCROLL_TOP_BLUR,
  MOBILE_TOP_BAR_ROOT,
  MOBILE_TOP_BAR_ROW,
  shouldHideMobileScrollChrome,
  shouldShowMobileDrawerButton,
} from "@/config/mobile-chrome";
import { PAYPLAN_ROUTE } from "@/config/navigation";
import { PAYPLAN_TOP_BAR_ACTIONS } from "@/config/payplan-mobile";
import { cn } from "@/lib/utils";

export function MobileScrollChrome() {
  const pathname = usePathname();
  const snapshot = useMobileScrollChromeSnapshot();
  const showDrawer = shouldShowMobileDrawerButton(pathname);
  const showPayplanTabs = pathname === PAYPLAN_ROUTE || pathname.startsWith(`${PAYPLAN_ROUTE}/`);

  if (shouldHideMobileScrollChrome(pathname)) {
    return null;
  }

  if (!snapshot && !showDrawer && !showPayplanTabs) {
    return null;
  }

  const showBlur = snapshot?.showBlur ?? false;
  const showCompactTitle = snapshot?.showCompactTitle ?? false;

  return (
    <>
      <div
        aria-hidden
        className={cn(MOBILE_SCROLL_TOP_BLUR, showBlur && "opacity-100")}
      />
      <header className={MOBILE_TOP_BAR_ROOT}>
        <div className={MOBILE_TOP_BAR_ROW}>
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
          {showPayplanTabs || showDrawer ? (
            <div className={PAYPLAN_TOP_BAR_ACTIONS}>
              {showPayplanTabs ? (
                <Suspense fallback={null}>
                  <PlannerMobileTopBarTabs />
                </Suspense>
              ) : null}
              {showDrawer ? <MobileTopBarDrawerButton /> : null}
            </div>
          ) : null}
        </div>
      </header>
    </>
  );
}
