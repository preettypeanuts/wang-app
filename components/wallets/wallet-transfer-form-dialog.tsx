"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useTransition } from "react";

import { createWalletTransferAction } from "@/app/actions/wallets";
import { AmountTextInput } from "@/components/shared/amount-text-input";
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
import { InsufficientWalletBalancePanel } from "@/components/wallets/insufficient-wallet-balance-panel";
import { WalletTransferAdminFeeField } from "@/components/wallets/wallet-transfer-admin-fee-field";
import { WalletTransferWalletPicker } from "@/components/wallets/wallet-transfer-wallet-picker";
import {
  FORM_DIALOG_BODY_SCROLL,
  FORM_FIELD_INPUT,
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
import { isWalletTransferAdminFeePreset } from "@/config/wallet-transfer-admin-fee";
import { useIsMobileViewport } from "@/hooks/use-is-mobile-viewport";
import { useProtectedCurrency } from "@/hooks/use-protected-currency";
import {
  buildInsufficientWalletBalanceMessage,
  isInsufficientWalletBalance,
} from "@/lib/finance/compute-wallet-balance";
import { parseAmount } from "@/lib/finance/parse-amount";
import {
  computeTransferTotalDebit,
  shouldShowTransferAdminFee,
} from "@/lib/wallets/transfer-admin-fee";
import {
  readTransferPattern,
  writeTransferPattern,
} from "@/lib/wallets/transfer-pattern-storage";
import { cn } from "@/lib/utils";
import type { WalletWithBalance } from "@/types/wallet";

interface WalletTransferFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  wallets: WalletWithBalance[];
}

function parseFormAmount(raw: FormDataEntryValue | null): number {
  if (typeof raw !== "string") {
    return 0;
  }

  return (
    parseAmount(raw) ??
    (Number.parseInt(raw.replace(/\D/g, ""), 10) || 0)
  );
}

function applySavedPattern(input: {
  setAmount: (value: string) => void;
  setAdminFeeEnabled: (value: boolean) => void;
  setAdminFeeAmount: (value: string) => void;
  setAdminFeeUseCustom: (value: boolean) => void;
  fromWalletId: string;
  toWalletId: string;
}) {
  const pattern = readTransferPattern(input.fromWalletId, input.toWalletId);

  if (!pattern) {
    input.setAmount("");
    input.setAdminFeeEnabled(false);
    input.setAdminFeeAmount("");
    input.setAdminFeeUseCustom(false);
    return;
  }

  input.setAmount(pattern.amount > 0 ? String(pattern.amount) : "");
  input.setAdminFeeEnabled(pattern.adminFeeEnabled);

  if (pattern.adminFeeEnabled && pattern.adminFeeAmount > 0) {
    input.setAdminFeeAmount(String(pattern.adminFeeAmount));
    input.setAdminFeeUseCustom(
      !isWalletTransferAdminFeePreset(pattern.adminFeeAmount),
    );
    return;
  }

  input.setAdminFeeAmount("");
  input.setAdminFeeUseCustom(false);
}

export function WalletTransferFormDialog({
  open,
  onOpenChange,
  wallets,
}: WalletTransferFormDialogProps) {
  const router = useRouter();
  const isMobile = useIsMobileViewport();
  const { formatAmount } = useProtectedCurrency();
  const [isPending, startTransition] = useTransition();
  const [fromWalletId, setFromWalletId] = useState("");
  const [toWalletId, setToWalletId] = useState("");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [adminFeeEnabled, setAdminFeeEnabled] = useState(false);
  const [adminFeeAmount, setAdminFeeAmount] = useState("");
  const [adminFeeUseCustom, setAdminFeeUseCustom] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmInsufficient, setConfirmInsufficient] = useState(false);
  const [pendingFormData, setPendingFormData] = useState<FormData | null>(null);

  useEffect(() => {
    if (!open || wallets.length < 2) {
      return;
    }

    setFromWalletId(wallets[0].id);
    setToWalletId(wallets[1].id);
    setNote("");
    setError(null);
    setConfirmInsufficient(false);
    setPendingFormData(null);
  }, [open, wallets]);

  useEffect(() => {
    if (!open || !fromWalletId || !toWalletId || fromWalletId === toWalletId) {
      return;
    }

    applySavedPattern({
      setAmount,
      setAdminFeeEnabled,
      setAdminFeeAmount,
      setAdminFeeUseCustom,
      fromWalletId,
      toWalletId,
    });
  }, [open, fromWalletId, toWalletId]);

  const walletPickerOptions = useMemo(
    () =>
      wallets.map((wallet) => ({
        id: wallet.id,
        name: wallet.name,
        type: wallet.type,
        icon: wallet.icon,
      })),
    [wallets],
  );

  const fromWallet = useMemo(
    () => wallets.find((wallet) => wallet.id === fromWalletId),
    [fromWalletId, wallets],
  );

  const toWallet = useMemo(
    () => wallets.find((wallet) => wallet.id === toWalletId),
    [toWalletId, wallets],
  );

  const showAdminFeeField = useMemo(() => {
    if (!fromWallet || !toWallet) {
      return false;
    }

    return shouldShowTransferAdminFee(fromWallet.type, toWallet.type);
  }, [fromWallet, toWallet]);

  const insufficientMessage = useMemo(() => {
    if (!fromWallet || !pendingFormData) {
      return "";
    }

    const parsedAmount = parseFormAmount(pendingFormData.get("amount"));
    const adminFeeRaw = pendingFormData.get("adminFeeEnabled");
    const adminFeeEnabledInForm = adminFeeRaw === "on";
    const parsedAdminFee = adminFeeEnabledInForm
      ? parseFormAmount(pendingFormData.get("adminFeeAmount"))
      : 0;
    const totalDebit = computeTransferTotalDebit(parsedAmount, parsedAdminFee);

    if (totalDebit <= 0) {
      return "";
    }

    return buildInsufficientWalletBalanceMessage({
      walletName: fromWallet.name,
      balanceLabel: formatAmount(fromWallet.balance),
      amountLabel: formatAmount(totalDebit),
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

      const parsedAmount = parseFormAmount(formData.get("amount"));
      const adminFeeEnabledInForm = formData.get("adminFeeEnabled") === "on";
      const parsedAdminFee = adminFeeEnabledInForm
        ? parseFormAmount(formData.get("adminFeeAmount"))
        : 0;

      writeTransferPattern(fromWalletId, toWalletId, {
        amount: parsedAmount,
        adminFeeEnabled: adminFeeEnabledInForm && parsedAdminFee > 0,
        adminFeeAmount: parsedAdminFee,
      });

      onOpenChange(false);
      router.refresh();
    });
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const formData = new FormData(event.currentTarget);
    const parsedAmount = parseFormAmount(formData.get("amount"));
    const adminFeeEnabledInForm = formData.get("adminFeeEnabled") === "on";
    const parsedAdminFee = adminFeeEnabledInForm
      ? parseFormAmount(formData.get("adminFeeAmount"))
      : 0;
    const totalDebit = computeTransferTotalDebit(parsedAmount, parsedAdminFee);

    if (
      fromWallet &&
      totalDebit > 0 &&
      isInsufficientWalletBalance(fromWallet.balance, totalDebit)
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

  function handleAdminFeeEnabledChange(enabled: boolean) {
    setAdminFeeEnabled(enabled);
    if (!enabled) {
      setAdminFeeAmount("");
      setAdminFeeUseCustom(false);
    }
  }

  function handleAdminFeePresetSelect(presetAmount: number) {
    setAdminFeeUseCustom(false);
    setAdminFeeAmount(String(presetAmount));
  }

  const parsedAdminFee =
    Number.parseInt(adminFeeAmount.replace(/\D/g, ""), 10) || 0;
  const adminFeeMissing =
    showAdminFeeField && adminFeeEnabled && parsedAdminFee <= 0;
  const adminFeeInvalid =
    showAdminFeeField &&
    adminFeeEnabled &&
    adminFeeUseCustom &&
    adminFeeAmount.trim().length === 0;

  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={onOpenChange}
      title={WALLET_TRANSFER_TITLE}
    >
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
              isPending
                ? WALLET_TRANSFER_SAVING
                : WALLET_INSUFFICIENT_PROCEED_TRANSFER
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
                <WalletTransferWalletPicker
                  backLabel={WALLET_TRANSFER_TITLE}
                  nestedInDrawer={isMobile}
                  onChange={setFromWalletId}
                  options={walletPickerOptions}
                  value={fromWalletId}
                />
              </FormDialogField>

              <FormDialogField label={WALLET_TRANSFER_TO}>
                <WalletTransferWalletPicker
                  backLabel={WALLET_TRANSFER_TITLE}
                  nestedInDrawer={isMobile}
                  onChange={setToWalletId}
                  options={walletPickerOptions}
                  value={toWalletId}
                />
              </FormDialogField>

              <FormDialogField
                label={WALLET_TRANSFER_AMOUNT}
                htmlFor="wallet-transfer-amount"
              >
                <AmountTextInput
                  id="wallet-transfer-amount"
                  name="amount"
                  value={amount}
                  onChange={(event) => setAmount(event.target.value)}
                  placeholder="0"
                  className={FORM_FIELD_INPUT}
                  required
                />
              </FormDialogField>

              {showAdminFeeField ? (
                <WalletTransferAdminFeeField
                  enabled={adminFeeEnabled}
                  amount={adminFeeAmount}
                  useCustomAmount={adminFeeUseCustom}
                  onEnabledChange={handleAdminFeeEnabledChange}
                  onPresetSelect={handleAdminFeePresetSelect}
                  onCustomSelect={() => {
                    setAdminFeeUseCustom(true);
                    setAdminFeeAmount("");
                  }}
                  onAmountChange={setAdminFeeAmount}
                  disabled={isPending}
                />
              ) : null}

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
                amount.trim().length === 0 ||
                adminFeeInvalid ||
                adminFeeMissing
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
