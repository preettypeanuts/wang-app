import { OverviewPageShell } from "@/components/overview/overview-page-shell";
import { MobileScrollSurface } from "@/components/shared/mobile-scroll-surface";
import { OVERVIEW_DESKTOP_SCROLL_INNER } from "@/config/overview-desktop";
import { OVERVIEW_MOBILE_PAGE_TITLE } from "@/config/overview-mobile";
import {
  OVERVIEW_PAGE_ROOT,
  OVERVIEW_PAGE_SCROLL,
  OVERVIEW_PAGE_SCROLL_INNER,
} from "@/config/overview";
import { STACK_GAP } from "@/config/spacing";
import { cn } from "@/lib/utils";

interface OverviewScrollShellProps {
  children: React.ReactNode;
  filtersSlot?: React.ReactNode;
}

export function OverviewScrollShell({
  children,
  filtersSlot,
}: OverviewScrollShellProps) {
  return (
    <OverviewPageShell>
      <div className={OVERVIEW_PAGE_ROOT}>
        <MobileScrollSurface
          className={OVERVIEW_PAGE_SCROLL}
          title="Overview"
          titleClassName={OVERVIEW_MOBILE_PAGE_TITLE}
        >
          <div
            className={cn(
              "flex flex-col",
              STACK_GAP,
              OVERVIEW_PAGE_SCROLL_INNER,
              OVERVIEW_DESKTOP_SCROLL_INNER,
            )}
          >
            {filtersSlot ? (
              <div className="shrink-0 max-md:-mt-1">{filtersSlot}</div>
            ) : null}
            {children}
          </div>
        </MobileScrollSurface>
      </div>
    </OverviewPageShell>
  );
}
