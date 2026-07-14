"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useTransition } from "react";

import {
  deleteJournalEntryAction,
  saveJournalEntryAction,
  updateTransactionWalletAction,
} from "@/app/actions/journal";
import { patchInboxBootstrapOnTransactionDeleted } from "@/lib/inbox/patch-inbox-on-transaction-deleted";
import { JournalAdjustmentIcon } from "@/components/journal/journal-adjustment-icon";
import { JournalCategoryIcon } from "@/components/journal/journal-category-icon";
import { JournalTransferIcon } from "@/components/journal/journal-transfer-icon";
import { JournalTypeBadge } from "@/components/journal/journal-type-badge";
import { JournalWalletBadge } from "@/components/journal/journal-wallet-badge";
import type { JournalWalletOption } from "@/components/journal/journal-filters-drawer";
import {
  JournalEntryFormFields,
  resolveCategoryForEntry,
} from "@/components/journal/journal-entry-form-fields";
import { useUserCategoryCatalog } from "@/components/providers/user-category-catalog-provider";
import { FormDialogField } from "@/components/shared/form-dialog-field";
import {
  ResponsiveDialog,
  ResponsiveDialogBody,
  ResponsiveDialogFooter,
  ResponsiveDialogHeader,
} from "@/components/shared/responsive-dialog";
import { Button } from "@/components/ui/button";
import { DialogDescription, DialogTitle } from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FORM_DIALOG_BODY_SCROLL,
  FORM_FIELD_SELECT,
  FORM_GROUP,
  FORM_PREVIEW_COMPACT,
  FORM_PREVIEW_COMPACT_AMOUNT,
} from "@/config/form-dialog";
import {
  PLANNER_SELECT_CONTENT,
  PLANNER_SELECT_ITEM,
  PLANNER_SELECT_TRIGGER,
} from "@/config/planner-manage";
import { SEPARATED_CONTROL } from "@/config/shape";
import { UI_LABEL_WALLET } from "@/config/ui-labels";
import { formatDateTime } from "@/lib/finance/format-datetime";
import { formatIdr } from "@/lib/finance/format-currency";
import { PencilSimpleIcon, TrashIcon } from "@/lib/icons";
import { cn } from "@/lib/utils";
import { toDateInputValue } from "@/lib/validations/planned-item";
import type { JournalEntry } from "@/types/journal";
import type { TransactionType } from "@/types/transaction";

type DialogMode = "view" | "edit";

interface JournalEntryDetailDialogProps {
  open: boolean;
  entry: JournalEntry | null;
  walletOptions?: JournalWalletOption[];
  onOpenChange: (open: boolean) => void;
}

export function JournalEntryDetailDialog({
  open,
  entry,
  walletOptions = [],
  onOpenChange,
}: JournalEntryDetailDialogProps) {
  const router = useRouter();
  const { getLabel } = useUserCategoryCatalog();
  const [isPending, startTransition] = useTransition();
  const [mode, setMode] = useState<DialogMode>("view");
  const [type, setType] = useState<TransactionType>("expense");
  const [category, setCategory] = useState<string>("food");
  const [walletId, setWalletId] = useState<string>("");
  const [occurredAtText, setOccurredAtText] = useState("");

  const isEdit = mode === "edit";

  useEffect(() => {
    if (!open || !entry) {
      return;
    }

    setMode("view");
    setType(entry.type);
    setCategory(resolveCategoryForEntry(entry.type, entry.category));
    setWalletId(entry.walletId ?? "");
    setOccurredAtText(toDateInputValue(entry.occurredAt));
  }, [open, entry]);

  const pickerOptions = useMemo(() => {
    if (!entry?.walletId) {
      return walletOptions;
    }

    if (walletOptions.some((option) => option.id === entry.walletId)) {
      return walletOptions;
    }

    return [
      ...walletOptions,
      {
        id: entry.walletId,
        name: entry.walletName ?? "Wallet lama",
      },
    ];
  }, [entry, walletOptions]);

  if (!entry) {
    return null;
  }

  const currentEntry = entry;
  const isIncome = currentEntry.type === "income";
  const isTransfer = currentEntry.type === "transfer";
  const isAdjustment = currentEntry.type === "adjustment";
  const canChangeWallet = !isTransfer && pickerOptions.length > 0;
  const title = currentEntry.rawInput.trim() || currentEntry.description;
  const categoryLabel = isTransfer
    ? "Transfer"
    : isAdjustment
      ? "Penyesuaian saldo"
      : getLabel(currentEntry.category);
  const showDescription =
    currentEntry.description.trim().length > 0 &&
    currentEntry.description.trim() !== currentEntry.rawInput.trim();
  const showRawInput = currentEntry.rawInput.trim().length > 0;
  const dialogTitle = isEdit ? "Edit transaksi" : title;

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) {
      setMode("view");
    }

    onOpenChange(nextOpen);
  }

  function handleWalletChange(nextWalletId: string | null) {
    if (!nextWalletId || nextWalletId === walletId) {
      return;
    }

    setWalletId(nextWalletId);
    startTransition(async () => {
      const result = await updateTransactionWalletAction({
        transactionId: currentEntry.id,
        walletId: nextWalletId,
      });

      if (result.ok) {
        router.refresh();
      }
    });
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    formData.set("id", currentEntry.id);
    formData.set("type", type);
    formData.set("category", category);
    formData.set("occurredAt", occurredAtText);

    startTransition(async () => {
      const result = await saveJournalEntryAction(formData);

      if (!result.ok) {
        return;
      }

      onOpenChange(false);
      router.refresh();
    });
  }

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteJournalEntryAction(currentEntry.id);

      if (!result.ok) {
        return;
      }

      if (result.deleted) {
        patchInboxBootstrapOnTransactionDeleted(result.deleted);
      }

      onOpenChange(false);
      router.refresh();
    });
  }

  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={handleOpenChange}
      title={dialogTitle}
      wide
    >
      <ResponsiveDialogHeader>
        <DialogTitle className="text-lg font-semibold tracking-tight">
          {dialogTitle}
        </DialogTitle>
        <DialogDescription className="text-[13px] leading-snug">
          {isEdit
            ? "Perbarui detail transaksi."
            : "Detail transaksi dan opsi kelola."}
        </DialogDescription>
      </ResponsiveDialogHeader>

      {isEdit ? (
        <form
          className="flex min-h-0 flex-1 flex-col overflow-hidden"
          onSubmit={handleSubmit}
        >
          <ResponsiveDialogBody className={FORM_DIALOG_BODY_SCROLL}>
            <JournalEntryFormFields
              amountDefault={String(Math.abs(currentEntry.amount))}
              category={category}
              descriptionDefault={currentEntry.description}
              occurredAtText={occurredAtText}
              onCategoryChange={setCategory}
              onOccurredAtTextChange={setOccurredAtText}
              onTypeChange={setType}
              rawInputDefault={currentEntry.rawInput}
              showRawInput
              type={type}
            />
          </ResponsiveDialogBody>

          <ResponsiveDialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={isPending}
              className={cn(SEPARATED_CONTROL, "flex-1")}
              onClick={() => setMode("view")}
            >
              Batal
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className={cn(SEPARATED_CONTROL, "flex-1")}
            >
              Simpan
            </Button>
          </ResponsiveDialogFooter>
        </form>
      ) : (
        <>
          <ResponsiveDialogBody className={FORM_DIALOG_BODY_SCROLL}>
            <div className="flex items-center gap-3 px-1 pb-1">
              {isTransfer ? (
                <JournalTransferIcon />
              ) : isAdjustment ? (
                <JournalAdjustmentIcon />
              ) : (
                <JournalCategoryIcon
                  category={currentEntry.category}
                  type={currentEntry.type}
                />
              )}
              <JournalTypeBadge type={currentEntry.type} />
              {currentEntry.walletName ? (
                <JournalWalletBadge name={currentEntry.walletName} />
              ) : null}
            </div>

            <div className={FORM_PREVIEW_COMPACT}>
              <div className="min-w-0">
                <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
                  Jumlah
                </p>
                <p
                  className={cn(
                    "mt-0.5",
                    FORM_PREVIEW_COMPACT_AMOUNT,
                    isTransfer || isAdjustment
                      ? "text-muted-foreground"
                      : isIncome
                        ? "text-[#2FAE52] dark:text-[#34C759]"
                        : "text-[#E85555] dark:text-[#FF6B6B]",
                  )}
                >
                  {isTransfer || isAdjustment
                    ? currentEntry.amount < 0
                      ? "−"
                      : "+"
                    : isIncome
                      ? "+"
                      : "−"}
                  {formatIdr(Math.abs(currentEntry.amount))}
                </p>
              </div>
              <div className="shrink-0 text-right text-[11px] leading-snug text-muted-foreground">
                <p>{categoryLabel}</p>
                <p className="font-medium text-foreground">
                  {isTransfer
                    ? currentEntry.amount < 0
                      ? "Transfer keluar"
                      : "Transfer masuk"
                    : isAdjustment
                      ? "Penyesuaian saldo"
                      : isIncome
                        ? "Pemasukan"
                        : "Pengeluaran"}
                </p>
              </div>
            </div>

            {canChangeWallet ? (
              <div className={FORM_GROUP}>
                <FormDialogField label={UI_LABEL_WALLET} htmlFor="journal-wallet">
                  <Select value={walletId} onValueChange={handleWalletChange}>
                    <SelectTrigger
                      id="journal-wallet"
                      className={cn(FORM_FIELD_SELECT, PLANNER_SELECT_TRIGGER)}
                      disabled={isPending}
                    >
                      <SelectValue placeholder="Pilih wallet" />
                    </SelectTrigger>
                    <SelectContent className={PLANNER_SELECT_CONTENT}>
                      {pickerOptions.map((option) => (
                        <SelectItem
                          key={option.id}
                          value={option.id}
                          className={PLANNER_SELECT_ITEM}
                        >
                          {option.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormDialogField>
              </div>
            ) : null}

            <div className={FORM_GROUP}>
              <div className="px-4 py-3">
                <p className="text-xs font-medium text-muted-foreground">
                  Waktu
                </p>
                <p className="mt-1 text-sm leading-relaxed text-foreground/90">
                  {formatDateTime(currentEntry.occurredAt)}
                </p>
              </div>
            </div>

            {showDescription ? (
              <div className={FORM_GROUP}>
                <div className="px-4 py-3">
                  <p className="text-xs font-medium text-muted-foreground">
                    Deskripsi
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-foreground/90">
                    {currentEntry.description}
                  </p>
                </div>
              </div>
            ) : null}

            {showRawInput ? (
              <div className={FORM_GROUP}>
                <div className="px-4 py-3">
                  <p className="text-xs font-medium text-muted-foreground">
                    Pesan inbox
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-foreground/90">
                    {currentEntry.rawInput}
                  </p>
                </div>
              </div>
            ) : null}
          </ResponsiveDialogBody>

          <ResponsiveDialogFooter>
            <Button
              type="button"
              size="icon"
              variant="destructive"
              disabled={isPending || isTransfer}
              className={cn(SEPARATED_CONTROL, "shrink-0")}
              onClick={handleDelete}
              aria-label="Hapus"
            >
              <span className="sr-only">Hapus</span>
              <TrashIcon className="size-4" />
            </Button>
            <div className="flex min-w-0 flex-1 gap-2">
              <Button
                type="button"
                size="icon"
                variant="outline"
                disabled={isPending || isTransfer || isAdjustment}
                className={cn(SEPARATED_CONTROL, "shrink-0")}
                onClick={() => setMode("edit")}
                aria-label="Edit"
              >
                <span className="sr-only">Edit</span>
                <PencilSimpleIcon className="size-4" />
              </Button>

              <Button
                type="button"
                disabled={isPending}
                className={cn(SEPARATED_CONTROL, "flex-1")}
                onClick={() => onOpenChange(false)}
              >
                Tutup
              </Button>
            </div>
          </ResponsiveDialogFooter>
        </>
      )}
    </ResponsiveDialog>
  );
}
