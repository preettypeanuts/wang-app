"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  MOBILE_BOTTOM_NAV_MENU_BUTTON,
  MOBILE_LIQUID_GLASS_SURFACE,
} from "@/config/mobile-nav";
import { prefetchInboxBootstrap } from "@/lib/inbox/fetch-inbox-bootstrap";
import { MobileNavInboxIcon } from "@/lib/icons";
import { cn } from "@/lib/utils";

export function MobileBottomNavInboxLink() {
  const pathname = usePathname();
  const active = pathname === "/";

  return (
    <Link
      aria-current={active ? "page" : undefined}
      aria-label="Inbox"
      className={cn(
        MOBILE_BOTTOM_NAV_MENU_BUTTON,
        MOBILE_LIQUID_GLASS_SURFACE,
        active && "text-primary",
      )}
      href="/"
      prefetch
      scroll={false}
      onTouchStart={prefetchInboxBootstrap}
    >
      <MobileNavInboxIcon aria-hidden className="size-6" />
    </Link>
  );
}
