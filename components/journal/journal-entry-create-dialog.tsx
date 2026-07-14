"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useTransition } from "react";

import { createJournalEntryAction } from "@/app/actions/journal";
import {
  getDefaultCategoryForType,
  JournalEntryFormFields,
} from "@/components/journal/journal-entry-form-fields";
import { InsufficientWalletBalancePanel } from "@/components/wallets/insufficient-wallet-balance-panel";
import {
  ResponsiveDialog,
  ResponsiveDialogBody,
  ResponsiveDialogFooter,
  ResponsiveDialogHeader,
} from "@/components/shared/responsive-dialog";
import { Button } from "@/components/ui/button";
import {
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  FORM_DIALOG_BODY_SCROLL,
} from "@/config/form-dialog";
import { SEPARATED_CONTROL } from "@/config/shape";
import {
  UI_LABEL_ADD_TRANSACTION,
  UI_LABEL_ADD_TRANSACTION_DESC,
  UI_LABEL_CANCEL,
  UI_LABEL_SAVE,
} from "@/config/ui-labels";
import { WALLET_INSUFFICIENT_PROCEED_RECORD } from "@/config/wallet-labels";
import { useProtectedCurrency } from "@/hooks/use-protected-currency";
import {
  buildInsufficientWalletBalanceMessage,
  isInsufficientWalletBalance,
} from "@/lib/finance/compute-wallet-balance";
import { parseAmount } from "@/lib/finance/parse-amount";
import { cn } from "@/lib/utils";
import { todayDateInputValue } from "@/lib/validations/planned-item";
import type { TransactionType } from "@/types/transaction";
import type { WalletWithBalance } from "@/types/wallet";

interface JournalEntryCreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultWallet?: Pick<WalletWithBalance, "id" | "name" | "balance"> | null;
}

export function JournalEntryCreateDialog({
  open,
  onOpenChange,
  defaultWallet = null,
}: JournalEntryCreateDialogProps) {
  const router = useRouter();
  const { formatAmount } = useProtectedCurrency();
  const [isPending, startTransition] = useTransition();
  const [type, setType] = useState<TransactionType>("expense");
  const [category, setCategory] = useState<string>("food");
  const [occurredAtText, setOccurredAtText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [formKey, setFormKey] = useState(0);
  const [confirmInsufficient, setConfirmInsufficient] = useState(false);
  const [pendingFormData, setPendingFormData] = useState<FormData | null>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    setType("expense");
    setCategory(getDefaultCategoryForType("expense"));
    setOccurredAtText(todayDateInputValue());
    setError(null);
    setConfirmInsufficient(false);
    setPendingFormData(null);
    setFormKey((current) => current + 1);
  }, [open]);

  const insufficientMessage = useMemo(() => {
    if (!defaultWallet || !pendingFormData || type !== "expense") {
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
      walletName: defaultWallet.name,
      balanceLabel: formatAmount(defaultWallet.balance),
      amountLabel: formatAmount(parsed),
      context: "expense",
    });
  }, [defaultWallet, formatAmount, pendingFormData, type]);

  function executeCreate(formData: FormData) {
    startTransition(async () => {
      const result = await createJournalEntryAction(formData);

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
    formData.set("type", type);
    formData.set("category", category);
    formData.set("occurredAt", occurredAtText);

    const amountRaw = formData.get("amount");
    const parsed =
      typeof amountRaw === "string"
        ? (parseAmount(amountRaw) ??
          (Number.parseInt(amountRaw.replace(/\D/g, ""), 10) || null))
        : null;

    if (
      type === "expense" &&
      defaultWallet &&
      parsed !== null &&
      parsed > 0 &&
      isInsufficientWalletBalance(defaultWallet.balance, parsed)
    ) {
      setPendingFormData(formData);
      setConfirmInsufficient(true);
      return;
    }

    executeCreate(formData);
  }

  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={onOpenChange}
      title={UI_LABEL_ADD_TRANSACTION}
      wide
    >
      <ResponsiveDialogHeader>
        <DialogTitle className="text-lg font-semibold tracking-tight">
          {UI_LABEL_ADD_TRANSACTION}
        </DialogTitle>
        <DialogDescription className="text-[13px] leading-snug">
          {UI_LABEL_ADD_TRANSACTION_DESC}
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
            onProceed={() => {
              if (pendingFormData) {
                executeCreate(pendingFormData);
              }
            }}
            isPending={isPending}
            proceedLabel={
              isPending ? "Menyimpan..." : WALLET_INSUFFICIENT_PROCEED_RECORD
            }
          />
        </ResponsiveDialogBody>
      ) : (
        <form
          className="flex min-h-0 flex-1 flex-col overflow-hidden"
          onSubmit={handleSubmit}
        >
          <ResponsiveDialogBody className={FORM_DIALOG_BODY_SCROLL}>
            <JournalEntryFormFields
              key={formKey}
              amountDefault=""
              category={category}
              descriptionDefault=""
              occurredAtText={occurredAtText}
              onCategoryChange={setCategory}
              onOccurredAtTextChange={setOccurredAtText}
              onTypeChange={(nextType) => {
                setConfirmInsufficient(false);
                setType(nextType);
              }}
              type={type}
            />
            {error ? (
              <p className="px-4 pt-1 text-[13px] text-destructive">{error}</p>
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
              disabled={isPending}
              className={cn(SEPARATED_CONTROL, "flex-1")}
            >
              {UI_LABEL_SAVE}
            </Button>
          </ResponsiveDialogFooter>
        </form>
      )}
    </ResponsiveDialog>
  );
}
