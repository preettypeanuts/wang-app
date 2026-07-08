import { Skeleton } from "@/components/ui/skeleton";
import {
  SETTINGS_IOS_GROUP,
  SETTINGS_IOS_ROW,
} from "@/config/settings-ios";
import { STACK_GAP } from "@/config/spacing";
import { cn } from "@/lib/utils";

export function ProfilePageSkeleton() {
  return (
    <div
      aria-busy="true"
      aria-label="Memuat profil"
      className={cn("flex flex-col gap-5 md:mt-3")}
    >
      <header className="hidden shrink-0 max-md:hidden">
        <Skeleton className="h-6 w-20" />
        <Skeleton className="mt-2 h-3 w-48" />
      </header>

      <Skeleton className="h-3 w-48 max-md:-mt-1 md:hidden" />

      <section className="space-y-3">
        <Skeleton className="h-4 w-12" />
        <div className={SETTINGS_IOS_GROUP}>
          <div className={SETTINGS_IOS_ROW}>
            <Skeleton className="size-14 shrink-0 rounded-full" />
            <div className="min-w-0 flex-1 space-y-2">
              <Skeleton className="h-5 w-36" />
              <Skeleton className="h-3.5 w-44" />
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <div className="space-y-1">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-3 w-56" />
        </div>

        <div className="space-y-4 rounded-xl bg-neutral-100 p-4 dark:bg-neutral-900">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="space-y-2">
              <Skeleton className="h-3.5 w-28" />
              <Skeleton className="h-10 w-full rounded-xl" />
            </div>
          ))}
        </div>

        <Skeleton className="h-10 w-full rounded-xl" />
      </section>
    </div>
  );
}
