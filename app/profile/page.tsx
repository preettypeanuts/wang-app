import { Suspense } from "react";

import { ProfilePageData } from "@/components/profile/profile-page-data";
import { ProfilePageSkeleton } from "@/components/profile/profile-page-skeleton";
import { ProfileMobileLayout } from "@/components/profile/profile-mobile-layout";
import { ProfileShell } from "@/components/profile/profile-shell";
import { MobileScrollSurface } from "@/components/shared/mobile-scroll-surface";
import { PROFILE_TITLE } from "@/config/settings-labels";
import { cn } from "@/lib/utils";

function ProfilePageFallback() {
  return (
    <div className={cn("flex min-h-0 flex-1 flex-col")}>
      <ProfileMobileLayout>
        <ProfileShell className="min-h-0 flex-1">
          <MobileScrollSurface
            className={cn(
              "flex min-h-0 flex-1 flex-col",
              "max-md:overflow-y-auto max-md:overscroll-y-contain",
              "md:overflow-hidden md:pb-20",
            )}
            fixedMobileTopBar
            title={PROFILE_TITLE}
          >
            <ProfilePageSkeleton />
          </MobileScrollSurface>
        </ProfileShell>
      </ProfileMobileLayout>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <Suspense fallback={<ProfilePageFallback />}>
      <ProfilePageData />
    </Suspense>
  );
}
