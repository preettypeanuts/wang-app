"use client";

import type { ReactNode } from "react";

import { ProfileMobileTopBar } from "@/components/profile/profile-mobile-top-bar";
import { FixedViewportPortal } from "@/components/shared/fixed-viewport-portal";

interface ProfileMobileLayoutProps {
  children: ReactNode;
}

export function ProfileMobileLayout({ children }: ProfileMobileLayoutProps) {
  return (
    <>
      <FixedViewportPortal>
        <div className="md:hidden">
          <ProfileMobileTopBar />
        </div>
      </FixedViewportPortal>

      {children}
    </>
  );
}
