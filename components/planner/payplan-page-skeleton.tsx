import { Skeleton } from "@/components/ui/skeleton";
import { PAYPLAN_MOBILE_PAGE_INSET_X } from "@/config/payplan-mobile";
import {
  PLANNER_CALENDAR_CELL,
  PLANNER_CALENDAR_FRAME,
  PLANNER_CALENDAR_GRID,
  PLANNER_CALENDAR_WEEKDAY_HEADER,
} from "@/config/planner-calendar";
import { STACK_GAP } from "@/config/spacing";
import { cn } from "@/lib/utils";

const WEEKDAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"];

export function PayplanPageSkeleton() {
  return (
    <div
      aria-busy="true"
      aria-label="Memuat PayPlan"
      className={cn("flex flex-col", STACK_GAP, PAYPLAN_MOBILE_PAGE_INSET_X)}
    >
      <header className="hidden shrink-0 md:block">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 space-y-2">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-3 w-56" />
          </div>
          <Skeleton className="h-9 w-44 shrink-0 rounded-full" />
        </div>
        <div className="mt-3 flex gap-2">
          <Skeleton className="h-9 w-28 rounded-full" />
          <Skeleton className="h-9 w-28 rounded-full" />
        </div>
      </header>

      <div className="shrink-0 space-y-3 md:hidden">
        <Skeleton className="h-3 w-56 max-md:-mt-1" />
        <Skeleton className="h-10 w-full rounded-xl" />
      </div>

      <div className={cn(PLANNER_CALENDAR_FRAME, "p-3")}>
        <div className="mb-3 flex items-center justify-between gap-3">
          <Skeleton className="size-8 rounded-full" />
          <Skeleton className="h-5 w-32" />
          <Skeleton className="size-8 rounded-full" />
        </div>

        <div className={PLANNER_CALENDAR_GRID}>
          {WEEKDAY_LABELS.map((label, index) => (
            <div key={`${label}-${index}`} className={PLANNER_CALENDAR_WEEKDAY_HEADER}>
              <Skeleton className="h-2.5 w-3" />
            </div>
          ))}
          {Array.from({ length: 42 }).map((_, index) => (
            <div key={index} className={PLANNER_CALENDAR_CELL}>
              <Skeleton className="ml-auto h-3 w-4" />
              {index % 5 === 0 ? (
                <Skeleton className="mt-1 h-1.5 w-[80%] rounded-full" />
              ) : null}
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-2 md:grid-cols-2">
        <Skeleton className="h-24 w-full rounded-xl" />
        <Skeleton className="h-24 w-full rounded-xl" />
      </div>
    </div>
  );
}
