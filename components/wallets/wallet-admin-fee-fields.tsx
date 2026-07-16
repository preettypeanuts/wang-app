"use client";

import { AmountTextInput } from "@/components/shared/amount-text-input";
import { FormDialogField } from "@/components/shared/form-dialog-field";
import { IosSwitch } from "@/components/shared/ios-switch";
import { WalletAdminFeeDayPicker } from "@/components/wallets/wallet-admin-fee-day-picker";
import { FORM_FIELD_INPUT } from "@/config/form-dialog";
import { SEPARATED_SURFACE } from "@/config/shape";
import {
  WALLET_FORM_ADMIN_FEE,
  WALLET_FORM_ADMIN_FEE_AMOUNT,
  WALLET_FORM_ADMIN_FEE_DAY,
  WALLET_FORM_ADMIN_FEE_HINT,
} from "@/config/wallet-labels";
import { cn } from "@/lib/utils";

interface WalletAdminFeeFieldsProps {
  enabled: boolean;
  amount: string;
  day: string;
  onEnabledChange: (enabled: boolean) => void;
  onAmountChange: (amount: string) => void;
  onDayChange: (day: string) => void;
  nestedInDrawer?: boolean;
  backLabel?: string;
  disabled?: boolean;
}

export function WalletAdminFeeFields({
  enabled,
  amount,
  day,
  onEnabledChange,
  onAmountChange,
  onDayChange,
  nestedInDrawer = false,
  backLabel,
  disabled = false,
}: WalletAdminFeeFieldsProps) {
  return (
    <div className="flex flex-col gap-3">
      <div
        className={cn(
          SEPARATED_SURFACE,
          "flex items-center justify-between gap-3 border border-black/6 bg-muted/35 px-3.5 py-3 dark:border-white/10 dark:bg-muted/20",
        )}
      >
        <div className="min-w-0 pr-2">
          <p className="text-sm font-medium text-foreground">
            {WALLET_FORM_ADMIN_FEE}
          </p>
          <p className="mt-0.5 text-xs leading-snug text-muted-foreground">
            {WALLET_FORM_ADMIN_FEE_HINT}
          </p>
        </div>
        <IosSwitch
          aria-label={WALLET_FORM_ADMIN_FEE}
          checked={enabled}
          disabled={disabled}
          onCheckedChange={onEnabledChange}
          className="shrink-0"
        />
      </div>

      {enabled ? (
        <div className="flex flex-col gap-4">
          <input type="hidden" name="adminFeeEnabled" value="on" />

          <FormDialogField
            label={WALLET_FORM_ADMIN_FEE_AMOUNT}
            htmlFor="wallet-admin-fee-amount"
          >
            <AmountTextInput
              id="wallet-admin-fee-amount"
              name="adminFeeAmount"
              value={amount}
              onChange={(event) => onAmountChange(event.target.value)}
              placeholder="15000"
              className={FORM_FIELD_INPUT}
              required
            />
          </FormDialogField>

          <FormDialogField label={WALLET_FORM_ADMIN_FEE_DAY}>
            <WalletAdminFeeDayPicker
              id="wallet-admin-fee-day"
              day={day}
              onDayChange={onDayChange}
              nestedInDrawer={nestedInDrawer}
              backLabel={backLabel}
              disabled={disabled}
              className="w-full"
            />
            <input type="hidden" name="adminFeeDay" value={day} />
          </FormDialogField>
        </div>
      ) : null}
    </div>
  );
}
