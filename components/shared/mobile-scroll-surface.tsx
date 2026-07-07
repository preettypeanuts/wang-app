"use client";

import { useRef } from "react";

import { usePersistentTabActive } from "@/components/shared/persistent-tab-active-context";
import { MobilePageTitle } from "@/components/shared/mobile-page-title";
import { useSyncMobileScrollChrome } from "@/components/shared/mobile-scroll-chrome-provider";
import { useSyncMobileTopBlur } from "@/components/shared/mobile-top-blur-provider";
import {
  MOBILE_CHROME_SCROLL_INSET,
  MOBILE_FIXED_TOP_BAR_SCROLL_INSET,
  MOBILE_PAGE_SCROLL_INSET_X,
  MOBILE_SCROLL_BOTTOM_SPACER,
} from "@/config/mobile-chrome";
import { useMobileLargeTitleScroll } from "@/hooks/use-mobile-large-title-scroll";
import { useMobileTopBlurScroll } from "@/hooks/use-mobile-top-blur-scroll";
import { cn } from "@/lib/utils";

interface MobileScrollSurfaceProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  titleClassName?: string;
  /** Fixed inbox-style top bar — no large title or global scroll chrome. */
  fixedMobileTopBar?: boolean;
}

export function MobileScrollSurface({
  children,
  className,
  title,
  titleClassName,
  fixedMobileTopBar = false,
}: MobileScrollSurfaceProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const isActiveTab = usePersistentTabActive();
  const syncGlobalChrome = Boolean(title) && !fixedMobileTopBar;
  const syncTopBlur = isActiveTab && (syncGlobalChrome || fixedMobileTopBar);
  const showLargeTitle = Boolean(title);
  const { showBlur: showLargeTitleBlur, showCompactTitle } =
    useMobileLargeTitleScroll(() => scrollRef.current, titleRef, {
      enabled: syncGlobalChrome && isActiveTab,
    });
  const showFixedBarBlur = useMobileTopBlurScroll(() => scrollRef.current, {
    enabled: syncTopBlur && fixedMobileTopBar,
    anchor: "top",
  });
  const showBlur = fixedMobileTopBar ? showFixedBarBlur : showLargeTitleBlur;

  useSyncMobileScrollChrome(
    syncGlobalChrome && isActiveTab ? title : undefined,
    showBlur,
    showCompactTitle,
  );

  useSyncMobileTopBlur(showBlur, syncTopBlur);

  const scrollInset = fixedMobileTopBar
    ? showLargeTitle
      ? MOBILE_CHROME_SCROLL_INSET
      : MOBILE_FIXED_TOP_BAR_SCROLL_INSET
    : MOBILE_CHROME_SCROLL_INSET;

  return (
    <div
      ref={scrollRef}
      className={cn(MOBILE_PAGE_SCROLL_INSET_X, scrollInset, className)}
    >
      {showLargeTitle ? (
        <MobilePageTitle ref={titleRef} className={titleClassName}>
          {title}
        </MobilePageTitle>
      ) : null}
      {children}
      <div aria-hidden className={MOBILE_SCROLL_BOTTOM_SPACER} />
    </div>
  );
}
