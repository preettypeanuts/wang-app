"use client";

import { PlanIcon } from "@/components/plans/plan-icon";
import { getCategoryLabel } from "@/config/categories";
import {
  PLAN_STATUS_ACCENT,
  PLAN_STATUS_LABEL,
  PLANS_CARD,
  PLANS_CARD_BODY,
  PLANS_CARD_DIVIDER,
  PLANS_CARD_FOOTER,
  PLANS_CARD_FOOTER_CONTENT,
  PLANS_WISH_CARD_MOBILE,
  PLANS_MOBILE_SOLID_DIVIDER,
  getPlanCategoryAccent,
} from "@/config/plans";
import { PLANS_NO_NOTE } from "@/config/plans-labels";
import { formatIdr } from "@/lib/finance/format-currency";
import { cn } from "@/lib/utils";
import type { PlanRecord } from "@/types/plan";

interface PlanCardProps {
  plan: PlanRecord;
  onClick: (plan: PlanRecord) => void;
}

export function PlanCard({ plan, onClick }: PlanCardProps) {
  const isDone = plan.status === "done";
  const categoryAccent = getPlanCategoryAccent(plan.category);
  const statusAccent = PLAN_STATUS_ACCENT[plan.status];

  return (
    <button
      type="button"
      onClick={() => onClick(plan)}
      className={cn(
        PLANS_CARD,
        PLANS_WISH_CARD_MOBILE,
        "w-full cursor-pointer text-left transition-opacity hover:opacity-95",
        isDone && "opacity-70",
      )}
    >
      <div className={PLANS_CARD_BODY}>
        <div className="flex items-center gap-2.5">
          <div
            className={cn(
              "flex size-9 shrink-0 items-center justify-center rounded-xl",
              categoryAccent.iconSurface,
            )}
          >
            <PlanIcon
              name={categoryAccent.icon}
              className={categoryAccent.iconColor}
            />
          </div>
          <h3 className="min-w-0 flex-1 truncate text-sm font-semibold text-foreground">
            {plan.name}
          </h3>
        </div>

        <div className="flex items-center justify-between gap-2">
          <span
            className={cn(
              "inline-flex shrink-0 rounded-lg px-2 py-0.5 text-[10px] font-semibold",
              categoryAccent.badge,
            )}
          >
            {getCategoryLabel(plan.category)}
          </span>
          <span
            className={cn(
              "inline-flex shrink-0 rounded-lg px-2 py-0.5 text-[10px] font-semibold",
              statusAccent.badge,
            )}
          >
            {PLAN_STATUS_LABEL[plan.status]}
          </span>
        </div>

        <div className="mt-auto">
          <p
            className={cn(
              "text-lg font-bold tabular-nums tracking-tight sm:text-xl",
              categoryAccent.valueColor,
            )}
          >
            {formatIdr(plan.amount)}
          </p>
        </div>
      </div>

      <div className={PLANS_CARD_FOOTER}>
        <div className={cn(PLANS_CARD_DIVIDER, PLANS_MOBILE_SOLID_DIVIDER)} />
        <div className={PLANS_CARD_FOOTER_CONTENT}>
          <p className="truncate text-[11px] text-muted-foreground">
            {plan.note?.trim() || PLANS_NO_NOTE}
          </p>
        </div>
      </div>
    </button>
  );
}
