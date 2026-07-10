"use client";

import {
  formatPayPlanPriorPaymentSummary,
  PAYPLAN_LABEL_ALREADY_PAID_BEFORE_HINT,
  PAYPLAN_LABEL_ALREADY_PAID_COUNT,
  PAYPLAN_LABEL_NEW_INSTALLMENT_FROM_START,
  PAYPLAN_LABEL_NEW_INSTALLMENT_HINT,
} from "@/config/payplan-labels";
import { AppleCheckbox } from "@/components/shared/apple-checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FORM_FIELD_INPUT, FORM_GROUP_DIVIDER } from "@/config/form-dialog";
import { cn } from "@/lib/utils";

interface PlannedItemPriorPaymentFieldsProps {
  isNewFromStart: boolean;
  paidPriorCount: string;
  maxInstallments: number | null;
  onIsNewFromStartChange: (value: boolean) => void;
  onPaidPriorCountChange: (value: string) => void;
}

export function PlannedItemPriorPaymentFields({
  isNewFromStart,
  paidPriorCount,
  maxInstallments,
  onIsNewFromStartChange,
  onPaidPriorCountChange,
}: PlannedItemPriorPaymentFieldsProps) {
  const paidCount = Number.parseInt(paidPriorCount, 10);
  const paidValid = Number.isFinite(paidCount) && paidCount >= 0;
  const remaining =
    maxInstallments !== null && paidValid
      ? Math.max(maxInstallments - paidCount, 0)
      : null;

  return (
    <div>
      <div className="px-4 py-3">
        <label className="flex cursor-pointer items-start gap-3">
          <AppleCheckbox
            checked={isNewFromStart}
            onCheckedChange={onIsNewFromStartChange}
          />
          <span className="min-w-0 text-sm leading-snug">
            <span className="font-medium text-foreground">
              {PAYPLAN_LABEL_NEW_INSTALLMENT_FROM_START}
            </span>
            <span className="mt-0.5 block text-xs text-muted-foreground">
              {PAYPLAN_LABEL_NEW_INSTALLMENT_HINT}
            </span>
          </span>
        </label>
      </div>

      {!isNewFromStart ? (
        <>
          <div className={FORM_GROUP_DIVIDER} />
          <div className="space-y-3 px-4 pb-3 pt-3">
            <div className="space-y-1.5">
              <Label
                htmlFor="planned-paid-prior"
                className="text-xs font-medium text-muted-foreground"
              >
                {PAYPLAN_LABEL_ALREADY_PAID_COUNT}
              </Label>
              <Input
                id="planned-paid-prior"
                name="paidInstallmentCount"
                type="number"
                min={0}
                inputMode="numeric"
                value={paidPriorCount}
                onChange={(event) => onPaidPriorCountChange(event.target.value)}
                placeholder="4"
                required
                className={cn(FORM_FIELD_INPUT, "tabular-nums")}
              />
              <p className="text-[11px] text-muted-foreground">
                {PAYPLAN_LABEL_ALREADY_PAID_BEFORE_HINT}
              </p>
            </div>

            {remaining !== null && maxInstallments !== null ? (
              <p className="text-xs text-muted-foreground">
                {formatPayPlanPriorPaymentSummary(
                  paidValid ? paidCount : "—",
                  maxInstallments,
                  paidValid ? remaining : undefined,
                )}
              </p>
            ) : null}
          </div>
        </>
      ) : null}
    </div>
  );
}
