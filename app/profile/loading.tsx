import { ProfilePageSkeleton } from "@/components/profile/profile-page-skeleton";
import { ProfileMobileLayout } from "@/components/profile/profile-mobile-layout";
import { ProfileShell } from "@/components/profile/profile-shell";
import { MobileScrollSurface } from "@/components/shared/mobile-scroll-surface";
import { cn } from "@/lib/utils";

export default function ProfileLoading() {
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
            title="Profil"
          >
            <ProfilePageSkeleton />
          </MobileScrollSurface>
        </ProfileShell>
      </ProfileMobileLayout>
    </div>
  );
}
