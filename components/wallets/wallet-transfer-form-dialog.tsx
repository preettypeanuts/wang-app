"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useTransition } from "react";

import { createWalletTransferAction } from "@/app/actions/wallets";
import { InsufficientWalletBalancePanel } from "@/components/wallets/insufficient-wallet-balance-panel";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FORM_DIALOG_BODY_SCROLL,
  FORM_FIELD_INPUT,
  FORM_FIELD_SELECT,
  FORM_GROUP,
} from "@/config/form-dialog";
import { SEPARATED_CONTROL } from "@/config/shape";
import { UI_LABEL_CANCEL } from "@/config/ui-labels";
import {
  WALLET_INSUFFICIENT_PROCEED_TRANSFER,
  WALLET_TRANSFER_AMOUNT,
  WALLET_TRANSFER_DESC,
  WALLET_TRANSFER_FROM,
  WALLET_TRANSFER_NOTE,
  WALLET_TRANSFER_NOTE_PLACEHOLDER,
  WALLET_TRANSFER_SAVE,
  WALLET_TRANSFER_SAVING,
  WALLET_TRANSFER_TITLE,
  WALLET_TRANSFER_TO,
} from "@/config/wallet-labels";
import { useProtectedCurrency } from "@/hooks/use-protected-currency";
import {
  buildInsufficientWalletBalanceMessage,
  isInsufficientWalletBalance,
} from "@/lib/finance/compute-wallet-balance";
import { parseAmount } from "@/lib/finance/parse-amount";
import { cn } from "@/lib/utils";
import type { WalletWithBalance } from "@/types/wallet";

interface WalletTransferFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  wallets: WalletWithBalance[];
}

export function WalletTransferFormDialog({
  open,
  onOpenChange,
  wallets,
}: WalletTransferFormDialogProps) {
  const router = useRouter();
  const { formatAmount } = useProtectedCurrency();
  const [isPending, startTransition] = useTransition();
  const [fromWalletId, setFromWalletId] = useState("");
  const [toWalletId, setToWalletId] = useState("");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [confirmInsufficient, setConfirmInsufficient] = useState(false);
  const [pendingFormData, setPendingFormData] = useState<FormData | null>(null);

  useEffect(() => {
    if (!open || wallets.length < 2) {
      return;
    }

    setFromWalletId(wallets[0].id);
    setToWalletId(wallets[1].id);
    setAmount("");
    setNote("");
    setError(null);
    setConfirmInsufficient(false);
    setPendingFormData(null);
  }, [open, wallets]);

  const fromWallet = useMemo(
    () => wallets.find((wallet) => wallet.id === fromWalletId),
    [fromWalletId, wallets],
  );

  const insufficientMessage = useMemo(() => {
    if (!fromWallet || !pendingFormData) {
      return "";
    }

    const amountRaw = pendingFormData.get("amount");
    const parsed =
      typeof amountRaw === "string"
        ? (parseAmount(amountRaw) ??
          (Number.parseInt(amountRaw.replace(/\D/g, ""), 10) || 0))
        : 0;

    if (parsed <= 0) {
      return "";
    }

    return buildInsufficientWalletBalanceMessage({
      walletName: fromWallet.name,
      balanceLabel: formatAmount(fromWallet.balance),
      amountLabel: formatAmount(parsed),
      context: "transfer",
    });
  }, [formatAmount, fromWallet, pendingFormData]);

  function executeTransfer(formData: FormData) {
    startTransition(async () => {
      const result = await createWalletTransferAction(formData);

      if (!result.ok) {
        setError(result.error);
        setConfirmInsufficient(false);
        return;
      }

      onOpenChange(false);
      router.refresh();
    });
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const formData = new FormData(event.currentTarget);
    const amountRaw = formData.get("amount");
    const parsed =
      typeof amountRaw === "string"
        ? (parseAmount(amountRaw) ??
          (Number.parseInt(amountRaw.replace(/\D/g, ""), 10) || null))
        : null;

    if (
      fromWallet &&
      parsed !== null &&
      parsed > 0 &&
      isInsufficientWalletBalance(fromWallet.balance, parsed)
    ) {
      setPendingFormData(formData);
      setConfirmInsufficient(true);
      return;
    }

    executeTransfer(formData);
  }

  function handleProceedDespiteInsufficient() {
    if (!pendingFormData) {
      return;
    }

    executeTransfer(pendingFormData);
  }

  return (
    <ResponsiveDialog open={open} onOpenChange={onOpenChange} title={WALLET_TRANSFER_TITLE}>
      <ResponsiveDialogHeader>
        <DialogTitle className="text-lg font-semibold tracking-tight">
          {WALLET_TRANSFER_TITLE}
        </DialogTitle>
        <DialogDescription className="text-[13px] leading-snug">
          {WALLET_TRANSFER_DESC}
        </DialogDescription>
      </ResponsiveDialogHeader>

      {confirmInsufficient ? (
        <ResponsiveDialogBody className={FORM_DIALOG_BODY_SCROLL}>
          <InsufficientWalletBalancePanel
            message={insufficientMessage}
            onBack={() => {
              setConfirmInsufficient(false);
              setPendingFormData(null);
            }}
            onProceed={handleProceedDespiteInsufficient}
            isPending={isPending}
            proceedLabel={
              isPending ? WALLET_TRANSFER_SAVING : WALLET_INSUFFICIENT_PROCEED_TRANSFER
            }
          />
        </ResponsiveDialogBody>
      ) : (
        <form
          className="flex min-h-0 flex-1 flex-col overflow-hidden"
          onSubmit={handleSubmit}
        >
          <ResponsiveDialogBody className={FORM_DIALOG_BODY_SCROLL}>
            <input type="hidden" name="fromWalletId" value={fromWalletId} />
            <input type="hidden" name="toWalletId" value={toWalletId} />

            <div className={FORM_GROUP}>
              <FormDialogField label={WALLET_TRANSFER_FROM}>
                <Select
                  value={fromWalletId}
                  onValueChange={(value) => {
                    if (value) {
                      setFromWalletId(value);
                    }
                  }}
                >
                  <SelectTrigger className={FORM_FIELD_SELECT}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {wallets.map((wallet) => (
                      <SelectItem key={wallet.id} value={wallet.id}>
                        {wallet.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormDialogField>

              <FormDialogField label={WALLET_TRANSFER_TO}>
                <Select
                  value={toWalletId}
                  onValueChange={(value) => {
                    if (value) {
                      setToWalletId(value);
                    }
                  }}
                >
                  <SelectTrigger className={FORM_FIELD_SELECT}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {wallets.map((wallet) => (
                      <SelectItem key={wallet.id} value={wallet.id}>
                        {wallet.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormDialogField>

              <FormDialogField
                label={WALLET_TRANSFER_AMOUNT}
                htmlFor="wallet-transfer-amount"
              >
                <Input
                  id="wallet-transfer-amount"
                  name="amount"
                  value={amount}
                  onChange={(event) => setAmount(event.target.value)}
                  placeholder="100000"
                  inputMode="numeric"
                  className={FORM_FIELD_INPUT}
                  required
                />
              </FormDialogField>

              <FormDialogField
                label={WALLET_TRANSFER_NOTE}
                htmlFor="wallet-transfer-note"
              >
                <Input
                  id="wallet-transfer-note"
                  name="note"
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                  placeholder={WALLET_TRANSFER_NOTE_PLACEHOLDER}
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
              disabled={
                isPending ||
                !fromWalletId ||
                !toWalletId ||
                fromWalletId === toWalletId ||
                amount.trim().length === 0
              }
              className={cn(SEPARATED_CONTROL, "flex-1")}
            >
              {isPending ? WALLET_TRANSFER_SAVING : WALLET_TRANSFER_SAVE}
            </Button>
          </ResponsiveDialogFooter>
        </form>
      )}
    </ResponsiveDialog>
  );
}
