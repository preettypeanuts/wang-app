"use client";

import type { ReactNode } from "react";

import { ProfileMobileTopBar } from "@/components/profile/profile-mobile-top-bar";
import { FixedViewportPortal } from "@/components/shared/fixed-viewport-portal";
import { INBOX_MOBILE_TOP_BLUR } from "@/config/inbox-mobile";
import { cn } from "@/lib/utils";

interface ProfileMobileLayoutProps {
  children: ReactNode;
}

export function ProfileMobileLayout({ children }: ProfileMobileLayoutProps) {
  return (
    <>
      <FixedViewportPortal>
        <div className="md:hidden">
          <div
            aria-hidden
            className={cn(INBOX_MOBILE_TOP_BLUR, "opacity-100")}
          />
          <ProfileMobileTopBar />
        </div>
      </FixedViewportPortal>

      {children}
    </>
  );
}
