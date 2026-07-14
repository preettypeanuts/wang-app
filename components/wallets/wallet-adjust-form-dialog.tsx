"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";

import { createWalletAdjustmentAction } from "@/app/actions/wallets";
import { FormDialogField } from "@/components/shared/form-dialog-field";
import {
  ResponsiveDialog,
  ResponsiveDialogBody,
  ResponsiveDialogFooter,
  ResponsiveDialogHeader,
} from "@/components/shared/responsive-dialog";
import { Button } from "@/components/ui/button";
import { DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  FORM_DIALOG_BODY_SCROLL,
  FORM_FIELD_INPUT,
  FORM_GROUP,
  FORM_PREVIEW_COMPACT,
  FORM_PREVIEW_COMPACT_AMOUNT,
} from "@/config/form-dialog";
import { SEPARATED_CONTROL } from "@/config/shape";
import { UI_LABEL_CANCEL } from "@/config/ui-labels";
import {
  WALLET_ADJUST_COMPUTED,
  WALLET_ADJUST_DESC,
  WALLET_ADJUST_DIFF,
  WALLET_ADJUST_NOTE,
  WALLET_ADJUST_NOTE_PLACEHOLDER,
  WALLET_ADJUST_SAVE,
  WALLET_ADJUST_SAVING,
  WALLET_ADJUST_TARGET,
  WALLET_ADJUST_TITLE,
} from "@/config/wallet-labels";
import { formatIdr } from "@/lib/finance/format-currency";
import { cn } from "@/lib/utils";
import type { WalletWithBalance } from "@/types/wallet";

interface WalletAdjustFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  wallet: WalletWithBalance | null;
}

export function WalletAdjustFormDialog({
  open,
  onOpenChange,
  wallet,
}: WalletAdjustFormDialogProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [actualBalance, setActualBalance] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !wallet) {
      return;
    }

    setActualBalance("");
    setNote("");
    setError(null);
  }, [open, wallet]);

  if (!wallet) {
    return null;
  }

  const parsedActual =
    Number.parseInt(actualBalance.replace(/\D/g, ""), 10) || 0;
  const diff = parsedActual - wallet.balance;

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    startTransition(async () => {
      const result = await createWalletAdjustmentAction(formData);

      if (!result.ok) {
        setError(result.error);
        return;
      }

      onOpenChange(false);
      router.refresh();
    });
  }

  return (
    <ResponsiveDialog open={open} onOpenChange={onOpenChange} title={WALLET_ADJUST_TITLE}>
      <ResponsiveDialogHeader>
        <DialogTitle className="text-lg font-semibold tracking-tight">
          {WALLET_ADJUST_TITLE}
        </DialogTitle>
        <DialogDescription className="text-[13px] leading-snug">
          {WALLET_ADJUST_DESC}
        </DialogDescription>
      </ResponsiveDialogHeader>

      <form
        className="flex min-h-0 flex-1 flex-col overflow-hidden"
        onSubmit={handleSubmit}
      >
        <ResponsiveDialogBody className={FORM_DIALOG_BODY_SCROLL}>
          <input type="hidden" name="walletId" value={wallet.id} />

          <div className={FORM_PREVIEW_COMPACT}>
            <div className="min-w-0">
              <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
                {WALLET_ADJUST_COMPUTED}
              </p>
              <p className={cn("mt-0.5", FORM_PREVIEW_COMPACT_AMOUNT)}>
                {formatIdr(wallet.balance)}
              </p>
            </div>
            <div className="shrink-0 text-right text-[11px] leading-snug text-muted-foreground">
              <p>{wallet.name}</p>
            </div>
          </div>

          <div className={FORM_GROUP}>
            <FormDialogField
              label={WALLET_ADJUST_TARGET}
              htmlFor="wallet-adjust-actual"
            >
              <Input
                id="wallet-adjust-actual"
                name="actualBalance"
                value={actualBalance}
                onChange={(event) => setActualBalance(event.target.value)}
                placeholder="0"
                inputMode="numeric"
                className={FORM_FIELD_INPUT}
                required
              />
            </FormDialogField>

            {actualBalance.trim() ? (
              <p className="px-4 text-[11px] text-muted-foreground">
                {WALLET_ADJUST_DIFF}{" "}
                <span
                  className={cn(
                    "font-semibold tabular-nums",
                    diff > 0
                      ? "text-[#2FAE52]"
                      : diff < 0
                        ? "text-[#E85555]"
                        : "text-foreground",
                  )}
                >
                  {diff > 0 ? "+" : ""}
                  {formatIdr(diff)}
                </span>
              </p>
            ) : null}

            <FormDialogField label={WALLET_ADJUST_NOTE} htmlFor="wallet-adjust-note">
              <Input
                id="wallet-adjust-note"
                name="note"
                value={note}
                onChange={(event) => setNote(event.target.value)}
                placeholder={WALLET_ADJUST_NOTE_PLACEHOLDER}
                className={FORM_FIELD_INPUT}
              />
            </FormDialogField>
          </div>

          {error ? (
            <p className="px-1 text-sm text-destructive">{error}</p>
          ) : null}
        </ResponsiveDialogBody>

        <ResponsiveDialogFooter>
          <Button
            type="button"
            variant="outline"
            disabled={isPending}
            className={cn(SEPARATED_CONTROL, "flex-1")}
            onClick={() => onOpenChange(false)}
          >
            {UI_LABEL_CANCEL}
          </Button>
          <Button
            type="submit"
            disabled={isPending || actualBalance.trim().length === 0 || diff === 0}
            className={cn(SEPARATED_CONTROL, "flex-1")}
          >
            {isPending ? WALLET_ADJUST_SAVING : WALLET_ADJUST_SAVE}
          </Button>
        </ResponsiveDialogFooter>
      </form>
    </ResponsiveDialog>
  );
}
