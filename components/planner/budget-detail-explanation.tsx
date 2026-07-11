"use client";

import { PAYPLAN_LABEL_BUDGET_EXPLANATION } from "@/config/payplan-labels";
import type {
  BudgetExplanationSegment,
  BudgetExplanationTone,
} from "@/lib/finance/build-budget-detail-explanation";
import { CheckCircleIcon, ExclamationTriangleIcon } from "@/lib/icons";
import { cn } from "@/lib/utils";
import type { BudgetPaceStatus } from "@/types/budget";

interface BudgetDetailExplanationProps {
  segments: BudgetExplanationSegment[];
  paceStatus: BudgetPaceStatus;
  remainingPercent: number;
  isOver: boolean;
}

const TONE_CLASS: Record<BudgetExplanationTone, string> = {
  amount: "font-semibold tabular-nums text-foreground",
  warning: "font-semibold tabular-nums text-[#FF9500]",
  danger: "font-semibold tabular-nums text-[#FF3B30]",
  success: "font-semibold tabular-nums text-[#34C759]",
};

function resolveExplanationShell(
  paceStatus: BudgetPaceStatus,
  remainingPercent: number,
  isOver: boolean,
): string {
  if (isOver || paceStatus === "over") {
    return "border-[#FF3B30]/20 bg-[#FF3B30]/6 dark:border-[#FF3B30]/25 dark:bg-[#FF3B30]/8";
  }

  if (paceStatus === "fast" || remainingPercent <= 20) {
    return "border-[#FF9500]/20 bg-[#FF9500]/6 dark:border-[#FF9500]/25 dark:bg-[#FF9500]/8";
  }

  if (paceStatus === "slow") {
    return "border-[#007AFF]/20 bg-[#007AFF]/6 dark:border-[#007AFF]/25 dark:bg-[#007AFF]/8";
  }

  return "border-black/8 bg-black/[0.03] dark:border-white/10 dark:bg-white/[0.04]";
}

function resolveHeaderIcon(
  paceStatus: BudgetPaceStatus,
  remainingPercent: number,
  isOver: boolean,
) {
  if (
    isOver ||
    paceStatus === "over" ||
    paceStatus === "fast" ||
    remainingPercent <= 20
  ) {
    return ExclamationTriangleIcon;
  }

  return CheckCircleIcon;
}

function resolveHeaderTone(
  paceStatus: BudgetPaceStatus,
  remainingPercent: number,
  isOver: boolean,
): string {
  if (isOver || paceStatus === "over") {
    return "text-[#FF3B30]";
  }

  if (paceStatus === "fast" || remainingPercent <= 20) {
    return "text-[#FF9500]";
  }

  if (paceStatus === "slow") {
    return "text-[#007AFF]";
  }

  return "text-muted-foreground";
}

export function BudgetDetailExplanation({
  segments,
  paceStatus,
  remainingPercent,
  isOver,
}: BudgetDetailExplanationProps) {
  const HeaderIcon = resolveHeaderIcon(paceStatus, remainingPercent, isOver);
  const headerTone = resolveHeaderTone(paceStatus, remainingPercent, isOver);

  return (
    <div
      className={cn(
        "mx-1 rounded-2xl border px-4 py-3",
        resolveExplanationShell(paceStatus, remainingPercent, isOver),
      )}
    >
      <div className="flex items-center gap-2">
        <HeaderIcon className={cn("size-3.5 shrink-0", headerTone)} />
        <p
          className={cn(
            "text-[10px] font-semibold uppercase tracking-widest",
            headerTone,
          )}
        >
          {PAYPLAN_LABEL_BUDGET_EXPLANATION}
        </p>
      </div>
      <p className="mt-2 text-[13px] leading-relaxed text-foreground/80">
        {segments.map((segment, index) =>
          segment.tone ? (
            <span
              key={`${segment.text}-${index}`}
              className={TONE_CLASS[segment.tone]}
            >
              {segment.text}
            </span>
          ) : (
            <span key={`${segment.text}-${index}`}>{segment.text}</span>
          ),
        )}
      </p>
    </div>
  );
}
