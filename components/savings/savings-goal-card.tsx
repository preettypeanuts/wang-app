"use client";

import {
  SAVINGS_CARD,
  SAVINGS_CARD_BODY,
  SAVINGS_CARD_DIVIDER,
  SAVINGS_CARD_FOOTER,
  SAVINGS_CARD_FOOTER_CONTENT,
  SAVINGS_MOBILE_SOLID_CARD,
  SAVINGS_MOBILE_SOLID_DIVIDER,
  SAVINGS_STATUS_ACCENT,
  SAVINGS_STATUS_LABEL,
} from "@/config/savings";
import {
  formatSavingsFromTarget,
  formatSavingsProgressPercent,
  PLANS_NO_NOTE,
} from "@/config/plans-labels";
import { formatIdr } from "@/lib/finance/format-currency";
import { getSavingsGoalProgress } from "@/lib/finance/build-savings-overview";
import { WalletIcon } from "@/lib/icons";
import { cn } from "@/lib/utils";
import type { SavingsGoalRecord } from "@/types/savings-goal";

interface SavingsGoalCardProps {
  goal: SavingsGoalRecord;
  onClick: (goal: SavingsGoalRecord) => void;
}

export function SavingsGoalCard({ goal, onClick }: SavingsGoalCardProps) {
  const progress = getSavingsGoalProgress(goal);
  const statusAccent = SAVINGS_STATUS_ACCENT[goal.status];

  return (
    <button
      type="button"
      onClick={() => onClick(goal)}
      className={cn(
        SAVINGS_CARD,
        SAVINGS_MOBILE_SOLID_CARD,
        "w-full cursor-pointer text-left transition-opacity hover:opacity-95",
        goal.status === "completed" && "opacity-70",
      )}
    >
      <div className={SAVINGS_CARD_BODY}>
        <div className="flex items-center gap-2.5">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-[#007AFF]/12 text-[#007AFF] dark:bg-[#007AFF]/20">
            <WalletIcon className="size-4" />
          </div>
          <h3 className="min-w-0 flex-1 truncate text-sm font-semibold text-foreground">
            {goal.name}
          </h3>
        </div>

        <div className="flex items-center justify-between gap-2">
          <span className="text-[10px] font-semibold text-muted-foreground">
            {formatSavingsProgressPercent(progress)}
          </span>
          <span
            className={cn(
              "inline-flex shrink-0 rounded-lg px-2 py-0.5 text-[10px] font-semibold",
              statusAccent.badge,
            )}
          >
            {SAVINGS_STATUS_LABEL[goal.status]}
          </span>
        </div>

        <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-black/8 dark:bg-white/10">
          <div
            className="h-full rounded-full bg-[#007AFF] transition-[width]"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="mt-auto">
          <p
            className={cn(
              "text-lg font-bold tabular-nums tracking-tight sm:text-xl",
              statusAccent.valueColor,
            )}
          >
            {formatIdr(goal.savedAmount)}
          </p>
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            {formatSavingsFromTarget(goal.targetAmount)}
          </p>
        </div>
      </div>

      <div className={SAVINGS_CARD_FOOTER}>
        <div className={cn(SAVINGS_CARD_DIVIDER, SAVINGS_MOBILE_SOLID_DIVIDER)} />
        <div className={SAVINGS_CARD_FOOTER_CONTENT}>
          <p className="truncate text-[11px] text-muted-foreground">
            {goal.note?.trim() || PLANS_NO_NOTE}
          </p>
        </div>
      </div>
    </button>
  );
}
