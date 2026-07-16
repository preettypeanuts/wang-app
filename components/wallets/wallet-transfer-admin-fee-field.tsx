"use client";

import { AmountTextInput } from "@/components/shared/amount-text-input";
import { FormDialogField } from "@/components/shared/form-dialog-field";
import { IosSwitch } from "@/components/shared/ios-switch";
import { FORM_FIELD_INPUT } from "@/config/form-dialog";
import { SEPARATED_SURFACE } from "@/config/shape";
import {
  WALLET_TRANSFER_ADMIN_FEE,
  WALLET_TRANSFER_ADMIN_FEE_AMOUNT,
  WALLET_TRANSFER_ADMIN_FEE_CUSTOM,
  WALLET_TRANSFER_ADMIN_FEE_HINT,
} from "@/config/wallet-labels";
import {
  isWalletTransferAdminFeePreset,
  WALLET_TRANSFER_ADMIN_FEE_PRESETS,
} from "@/config/wallet-transfer-admin-fee";
import { formatIdr } from "@/lib/finance/format-currency";
import { cn } from "@/lib/utils";

const ADMIN_FEE_CHIP = [
  "rounded-full border px-3 py-1.5 text-[11px] font-medium transition-colors",
  "border-black/8 bg-black/4 text-foreground",
  "hover:bg-black/8 active:scale-[0.98]",
  "dark:border-white/12 dark:bg-white/8 dark:hover:bg-white/12",
].join(" ");

const ADMIN_FEE_CHIP_SELECTED = [
  "border-primary/30 bg-primary/12 text-primary",
  "hover:bg-primary/16 dark:border-primary/35 dark:bg-primary/18",
].join(" ");

interface WalletTransferAdminFeeFieldProps {
  enabled: boolean;
  amount: string;
  useCustomAmount: boolean;
  onEnabledChange: (enabled: boolean) => void;
  onPresetSelect: (amount: number) => void;
  onCustomSelect: () => void;
  onAmountChange: (amount: string) => void;
  disabled?: boolean;
}

export function WalletTransferAdminFeeField({
  enabled,
  amount,
  useCustomAmount,
  onEnabledChange,
  onPresetSelect,
  onCustomSelect,
  onAmountChange,
  disabled = false,
}: WalletTransferAdminFeeFieldProps) {
  const parsedAmount = Number.parseInt(amount.replace(/\D/g, ""), 10) || 0;

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
            {WALLET_TRANSFER_ADMIN_FEE}
          </p>
          <p className="mt-0.5 text-xs leading-snug text-muted-foreground">
            {WALLET_TRANSFER_ADMIN_FEE_HINT}
          </p>
        </div>
        <IosSwitch
          aria-label={WALLET_TRANSFER_ADMIN_FEE}
          checked={enabled}
          disabled={disabled}
          onCheckedChange={onEnabledChange}
          className="shrink-0"
        />
      </div>

      {enabled ? (
        <>
          <input type="hidden" name="adminFeeEnabled" value="on" />
          <input type="hidden" name="adminFeeAmount" value={amount} />

          <div className="flex flex-wrap gap-1.5 px-1">
            {WALLET_TRANSFER_ADMIN_FEE_PRESETS.map((preset) => {
              const selected =
                !useCustomAmount &&
                parsedAmount === preset &&
                isWalletTransferAdminFeePreset(parsedAmount);

              return (
                <button
                  key={preset}
                  type="button"
                  disabled={disabled}
                  onClick={() => onPresetSelect(preset)}
                  className={cn(
                    ADMIN_FEE_CHIP,
                    selected && ADMIN_FEE_CHIP_SELECTED,
                  )}
                >
                  {formatIdr(preset)}
                </button>
              );
            })}
            <button
              type="button"
              disabled={disabled}
              onClick={onCustomSelect}
              className={cn(
                ADMIN_FEE_CHIP,
                useCustomAmount && ADMIN_FEE_CHIP_SELECTED,
              )}
            >
              {WALLET_TRANSFER_ADMIN_FEE_CUSTOM}
            </button>
          </div>

          {useCustomAmount ? (
            <FormDialogField
              label={WALLET_TRANSFER_ADMIN_FEE_AMOUNT}
              htmlFor="wallet-transfer-admin-fee-amount"
            >
              <AmountTextInput
                id="wallet-transfer-admin-fee-amount"
                value={amount}
                onChange={(event) => onAmountChange(event.target.value)}
                placeholder="10000"
                className={FORM_FIELD_INPUT}
                required
              />
            </FormDialogField>
          ) : null}
        </>
      ) : null}
    </div>
  );
}
