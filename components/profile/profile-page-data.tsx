import { ChangePasswordForm } from "@/components/profile/change-password-form";
import { ProfileMobileLayout } from "@/components/profile/profile-mobile-layout";
import { ProfileShell } from "@/components/profile/profile-shell";
import { ProfileSummary } from "@/components/profile/profile-summary";
import { MobileScrollSurface } from "@/components/shared/mobile-scroll-surface";
import {
  PROFILE_TITLE,
  PROFILE_DESC,
  PROFILE_ACCOUNT,
} from "@/config/settings-labels";
import { getSession, requireUserId } from "@/lib/auth/session";
import { cn } from "@/lib/utils";

export async function ProfilePageData() {
  await requireUserId();
  const session = await getSession();
  const user = session?.user;

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
            <header className="shrink-0 max-md:hidden">
              <h1 className="mt-0.5 text-base font-semibold tracking-tight sm:text-lg">
                {PROFILE_TITLE}
              </h1>
              <p className="mt-0.5 text-[11px] text-muted-foreground sm:text-xs">
                {PROFILE_DESC}
              </p>
            </header>

            <p className="shrink-0 text-[11px] text-muted-foreground max-md:-mt-1 md:hidden">
              {PROFILE_DESC}
            </p>

            <div className="flex flex-col gap-5 md:mt-3">
              {user ? (
                <section className="space-y-3">
                  <h2 className="text-[13px] font-medium text-muted-foreground">
                    {PROFILE_ACCOUNT}
                  </h2>
                  <ProfileSummary email={user.email} name={user.name} />
                </section>
              ) : null}

              <ChangePasswordForm />
            </div>
          </MobileScrollSurface>
        </ProfileShell>
      </ProfileMobileLayout>
    </div>
  );
}
