"use client";

import { usePathname } from "next/navigation";
import {
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

import { MobileBottomNavActiveIndicator } from "@/components/shared/mobile-bottom-nav-active-indicator";
import { MobileBottomNavInboxLink } from "@/components/shared/mobile-bottom-nav-inbox-link";
import { MobileBottomNavLink } from "@/components/shared/mobile-bottom-nav-link";
import {
  MOBILE_BOTTOM_NAV_ITEM_WRAPPER,
  MOBILE_BOTTOM_NAV_PILL,
  MOBILE_BOTTOM_NAV_ROOT,
  MOBILE_LIQUID_GLASS_SURFACE,
  isNavItemActive,
  mobileBottomNavItems,
} from "@/config/mobile-nav";
import { PAYPLAN_ROUTE, PLANS_ROUTE } from "@/config/navigation";
import {
  MOBILE_BOTTOM_NAV_INDICATOR_INSET_X,
  MOBILE_BOTTOM_NAV_INDICATOR_PAYPLAN_EXTRA_RIGHT,
  MOBILE_BOTTOM_NAV_INDICATOR_PLANS_EXTRA_RIGHT,
} from "@/config/mobile-bottom-nav-motion";
import { cn } from "@/lib/utils";

interface IndicatorMetrics {
  x: number;
  width: number;
}

function readIndicatorMetrics(
  pill: HTMLUListElement,
  item: HTMLLIElement | null,
  href?: string,
): IndicatorMetrics | null {
  if (!item) {
    return null;
  }

  const pillRect = pill.getBoundingClientRect();
  const itemRect = item.getBoundingClientRect();
  const insetX = MOBILE_BOTTOM_NAV_INDICATOR_INSET_X;
  const extraRight =
    href === PLANS_ROUTE
      ? MOBILE_BOTTOM_NAV_INDICATOR_PLANS_EXTRA_RIGHT
      : href === PAYPLAN_ROUTE
        ? MOBILE_BOTTOM_NAV_INDICATOR_PAYPLAN_EXTRA_RIGHT
        : 0;

  return {
    x: itemRect.left - pillRect.left + insetX,
    width: itemRect.width - insetX * 2 - extraRight,
  };
}

export function MobileBottomNav() {
  const pathname = usePathname();
  const pillRef = useRef<HTMLUListElement>(null);
  const itemRefs = useRef(new Map<string, HTMLLIElement>());
  const [indicator, setIndicator] = useState<IndicatorMetrics>({
    x: 0,
    width: 0,
  });
  const [indicatorReady, setIndicatorReady] = useState(false);

  const syncIndicator = useCallback(() => {
    const pill = pillRef.current;

    if (!pill) {
      return;
    }

    const activeItem = mobileBottomNavItems.find((item) =>
      isNavItemActive(pathname, item.href),
    );
    const node = activeItem ? itemRefs.current.get(activeItem.href) : null;
    const metrics = readIndicatorMetrics(
      pill,
      node ?? null,
      activeItem?.href,
    );

    if (!metrics) {
      return;
    }

    setIndicator(metrics);
    setIndicatorReady(true);
  }, [pathname]);

  useLayoutEffect(() => {
    syncIndicator();
  }, [syncIndicator]);

  useLayoutEffect(() => {
    const pill = pillRef.current;

    if (!pill) {
      return;
    }

    const observer = new ResizeObserver(() => {
      syncIndicator();
    });

    observer.observe(pill);

    return () => observer.disconnect();
  }, [syncIndicator]);

  return (
    <nav aria-label="Navigasi utama" className={MOBILE_BOTTOM_NAV_ROOT}>
      <ul
        ref={pillRef}
        className={cn(
          MOBILE_BOTTOM_NAV_PILL,
          MOBILE_LIQUID_GLASS_SURFACE,
          "relative",
        )}
      >
        <MobileBottomNavActiveIndicator
          visible={indicatorReady}
          width={indicator.width}
          x={indicator.x}
        />
        {mobileBottomNavItems.map((item) => (
          <li
            className={MOBILE_BOTTOM_NAV_ITEM_WRAPPER}
            key={item.href}
            ref={(node) => {
              if (node) {
                itemRefs.current.set(item.href, node);
                return;
              }

              itemRefs.current.delete(item.href);
            }}
          >
            <MobileBottomNavLink
              active={isNavItemActive(pathname, item.href)}
              item={item}
            />
          </li>
        ))}
      </ul>

      <MobileBottomNavInboxLink />
    </nav>
  );
}
