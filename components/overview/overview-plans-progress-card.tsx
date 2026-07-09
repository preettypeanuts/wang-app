"use client";

import { HeartIcon } from "@/lib/icons";

import { PlansInsightBadgeIcon } from "@/components/shared/ai-summary-badge-icon";
import { BalanceVisibilityToggle } from "@/components/shared/balance-visibility-toggle";
import { OverviewActionLink } from "@/components/overview/overview-action-link";
import { OverviewIconShell } from "@/components/overview/overview-icon-shell";
import { OverviewStatusBadge } from "@/components/overview/overview-status-badge";
import {
  OVERVIEW_CARD,
  OVERVIEW_CARD_PADDING,
  OVERVIEW_SECTION_LABEL,
  OVERVIEW_SECTION_TITLE,
} from "@/config/overview";
import { PLANS_ROUTE, WISH_PAGE_TITLE } from "@/config/navigation";
import { useProtectedCurrency } from "@/hooks/use-protected-currency";
import { cn } from "@/lib/utils";
import type { PlansOverview } from "@/types/plan";

interface OverviewPlansProgressCardProps {
  overview: PlansOverview;
  className?: string;
}

export function OverviewPlansProgressCard({
  overview,
  className,
}: OverviewPlansProgressCardProps) {
  const { formatAmount } = useProtectedCurrency();
  const progress =
    overview.availableBalance <= 0
      ? overview.estimatedCost > 0
        ? 100
        : 0
      : Math.min(
          100,
          Math.round(
            (overview.estimatedCost / overview.availableBalance) * 100,
          ),
        );

  return (
    <section className={cn(OVERVIEW_CARD, OVERVIEW_CARD_PADDING, className)}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-2.5">
          <OverviewIconShell variant="pink">
            <HeartIcon />
          </OverviewIconShell>
          <div className="min-w-0">
            <p className={OVERVIEW_SECTION_LABEL}>{WISH_PAGE_TITLE} Progress</p>
            <h2 className={cn("mt-0.5", OVERVIEW_SECTION_TITLE)}>
              Wishlist aktif
            </h2>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <OverviewStatusBadge
            icon={<PlansInsightBadgeIcon tone={overview.insightMeta.tone} />}
            label={overview.insightMeta.label}
          />
          <BalanceVisibilityToggle />
        </div>
      </div>

      <div className="mt-4">
        <div className="flex items-end justify-between gap-2">
          <p className="text-2xl font-semibold tabular-nums tracking-tight">
            {overview.activeCount}
          </p>
          <p className="text-[11px] text-muted-foreground">wish aktif</p>
        </div>

        <div className="mt-3 h-2 overflow-hidden rounded-full bg-black/8 dark:bg-white/10">
          <div
            className={cn(
              "h-full rounded-full transition-[width]",
              overview.insightMeta.tone === "unsafe"
                ? "bg-[#FF3B30]"
                : overview.insightMeta.tone === "tight"
                  ? "bg-[#FF9500]"
                  : "bg-[#34C759]",
            )}
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2 text-[11px]">
          <div>
            <p className="text-muted-foreground">Estimasi</p>
            <p className="mt-0.5 font-semibold tabular-nums">
              {formatAmount(overview.estimatedCost)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-muted-foreground">Proyeksi sisa</p>
            <p
              className={cn(
                "mt-0.5 font-semibold tabular-nums",
                overview.projectedBalance < 0
                  ? "text-[#FF3B30]"
                  : "text-foreground/90",
              )}
            >
              {formatAmount(overview.projectedBalance)}
            </p>
          </div>
        </div>
      </div>

      <OverviewActionLink href={PLANS_ROUTE} className="mt-4">
        Lihat {WISH_PAGE_TITLE} →
      </OverviewActionLink>
    </section>
  );
}
