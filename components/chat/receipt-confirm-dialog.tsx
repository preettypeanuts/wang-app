"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { JournalCategoryIcon } from "@/components/journal/journal-category-icon";
import { useUserCategoryCatalog } from "@/components/providers/user-category-catalog-provider";
import { AmountTextInput } from "@/components/shared/amount-text-input";
import { FormDatePicker } from "@/components/shared/form-date-picker";
import {
  ResponsiveDialog,
  ResponsiveDialogBody,
  ResponsiveDialogFooter,
  ResponsiveDialogHeader,
} from "@/components/shared/responsive-dialog";
import { FormDialogField } from "@/components/shared/form-dialog-field";
import { Button } from "@/components/ui/button";
import {
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
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
  FORM_FIELD_DATE,
  FORM_FIELD_GRID_ROW,
  FORM_FIELD_INPUT,
  FORM_FIELD_SELECT,
  FORM_GROUP,
  FORM_PREVIEW_COMPACT,
  FORM_PREVIEW_COMPACT_AMOUNT,
  FORM_SEGMENT,
  FORM_SEGMENT_ACTIVE,
  FORM_SEGMENT_INACTIVE,
  FORM_SEGMENTED,
} from "@/config/form-dialog";
import {
  PLANNER_SELECT_CONTENT,
  PLANNER_SELECT_ITEM,
  PLANNER_SELECT_TRIGGER,
} from "@/config/planner-manage";
import { resolveCategoryForTransaction } from "@/lib/finance/user-category-catalog";
import { formatIdr } from "@/lib/finance/format-currency";
import { cn } from "@/lib/utils";
import { toDateInputValue } from "@/lib/validations/planned-item";
import type { ReceiptDraft } from "@/types/receipt";
import type { TransactionType } from "@/types/transaction";

interface ReceiptConfirmDialogProps {
  open: boolean;
  draft: ReceiptDraft | null;
  previewUrl: string | null;
  notice?: string | null;
  mode?: "create" | "edit";
  onOpenChange: (open: boolean) => void;
  onConfirm: (input: {
    type: TransactionType;
    amount: string;
    category: string;
    description: string;
    merchant: string;
    occurredAt: string;
  }) => Promise<void>;
}

export function ReceiptConfirmDialog({
  open,
  draft,
  previewUrl,
  notice = null,
  mode = "create",
  onOpenChange,
  onConfirm,
}: ReceiptConfirmDialogProps) {
  const [isPending, startTransition] = useTransition();
  const [type, setType] = useState<TransactionType>("expense");
  const [amountDraft, setAmountDraft] = useState("");
  const [category, setCategory] = useState<string>("food");
  const { catalog, getMentionOptions } = useUserCategoryCatalog();
  const [description, setDescription] = useState("");
  const [merchant, setMerchant] = useState("");
  const [occurredAtText, setOccurredAtText] = useState("");

  useEffect(() => {
    if (!open || !draft) {
      return;
    }

    setType(draft.type);
    setAmountDraft(String(draft.amount));
    setCategory(
      resolveCategoryForTransaction(draft.category, draft.type, catalog),
    );
    setDescription(draft.description);
    setMerchant(draft.merchant);
    setOccurredAtText(toDateInputValue(new Date(draft.occurredAt)));
  }, [catalog, draft, open]);

  const categoryOptions = useMemo(
    () => getMentionOptions(type),
    [getMentionOptions, type],
  );

  const previewAmount = Number.parseInt(amountDraft, 10) || 0;

  function handleTypeChange(nextType: TransactionType) {
    setType(nextType);
    setCategory((current) =>
      resolveCategoryForTransaction(current, nextType, catalog),
    );
  }

  function handleConfirm() {
    startTransition(async () => {
      const occurredAt = occurredAtText
        ? new Date(`${occurredAtText}T12:00:00`).toISOString()
        : new Date().toISOString();

      await onConfirm({
        type,
        amount: amountDraft,
        category,
        description: description.trim(),
        merchant: merchant.trim(),
        occurredAt,
      });
    });
  }

  const isEditMode = mode === "edit";
  const title = notice
    ? "Isi struk manual"
    : isEditMode
      ? "Perbaiki struk"
      : "Konfirmasi struk";
  const dialogDescription = notice
    ? "Lihat preview struk lalu isi nominal dan detail transaksi."
    : isEditMode
      ? "Sesuaikan data struk jika ada yang tidak cocok."
      : "Periksa data dari struk sebelum dicatat ke inbox.";

  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      wide
    >
      <ResponsiveDialogHeader>
        <DialogTitle className="text-lg font-semibold tracking-tight">
          {title}
        </DialogTitle>
        <DialogDescription className="text-[13px] leading-snug">
          {dialogDescription}
        </DialogDescription>
      </ResponsiveDialogHeader>

      {previewUrl ? (
        <div className="shrink-0 border-b border-black/8 px-4 py-3 dark:border-white/10">
          <div className="overflow-hidden rounded-xl border border-black/10 bg-white/20 shadow-sm dark:border-black/15">
            <img
              src={previewUrl}
              alt="Preview struk"
              className="mx-auto block max-h-72 w-full object-contain"
              draggable={false}
            />
          </div>
        </div>
      ) : null}

      <ResponsiveDialogBody className={FORM_DIALOG_BODY_SCROLL}>
          {notice ? (
            <p className="rounded-xl border border-amber-500/25 bg-amber-500/10 px-3 py-2 text-[13px] leading-snug text-amber-950 dark:text-amber-100">
              {notice}
            </p>
          ) : null}

          <div className={FORM_PREVIEW_COMPACT}>
            <div className="min-w-0">
              <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
                Total struk
              </p>
              <p className={cn("mt-0.5", FORM_PREVIEW_COMPACT_AMOUNT)}>
                {formatIdr(previewAmount)}
              </p>
            </div>
            <div className="shrink-0 text-right text-[11px] leading-snug text-muted-foreground">
              <p>{merchant.trim() || "Merchant"}</p>
              <p>{type === "income" ? "Pemasukan" : "Pengeluaran"}</p>
            </div>
          </div>

          <div className={FORM_GROUP}>
            <fieldset className="border-0 px-4 py-3">
              <legend className="sr-only">Jenis transaksi</legend>
              <div className={FORM_SEGMENTED}>
                <button
                  type="button"
                  aria-pressed={type === "expense"}
                  onClick={() => handleTypeChange("expense")}
                  className={cn(
                    FORM_SEGMENT,
                    type === "expense"
                      ? FORM_SEGMENT_ACTIVE
                      : FORM_SEGMENT_INACTIVE,
                  )}
                >
                  Keluar
                </button>
                <button
                  type="button"
                  aria-pressed={type === "income"}
                  onClick={() => handleTypeChange("income")}
                  className={cn(
                    FORM_SEGMENT,
                    type === "income"
                      ? FORM_SEGMENT_ACTIVE
                      : FORM_SEGMENT_INACTIVE,
                  )}
                >
                  Masuk
                </button>
              </div>
            </fieldset>

            <div className={FORM_FIELD_GRID_ROW}>
              <FormDialogField
                label="Nominal (Rp)"
                htmlFor="receipt-amount"
                gridItem
              >
                <AmountTextInput
                  id="receipt-amount"
                  value={amountDraft}
                  onChange={(event) => setAmountDraft(event.target.value)}
                  className={FORM_FIELD_INPUT}
                  placeholder="0"
                />
              </FormDialogField>

              <FormDialogField label="Tanggal" htmlFor="receipt-date" gridItem>
                <FormDatePicker
                  id="receipt-date"
                  name="occurredAt"
                  value={occurredAtText}
                  onChange={setOccurredAtText}
                  className={FORM_FIELD_DATE}
                />
              </FormDialogField>
            </div>

            <FormDialogField label="Merchant" htmlFor="receipt-merchant">
              <Input
                id="receipt-merchant"
                value={merchant}
                onChange={(event) => setMerchant(event.target.value)}
                className={FORM_FIELD_INPUT}
                placeholder="Indomaret, Starbucks, Grab..."
              />
            </FormDialogField>

            <FormDialogField label="Deskripsi" htmlFor="receipt-description">
              <Input
                id="receipt-description"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                className={FORM_FIELD_INPUT}
                placeholder="Belanja harian, makan siang..."
              />
            </FormDialogField>

            <FormDialogField label="Kategori" htmlFor="receipt-category">
              <Select
                value={category}
                onValueChange={(value) => {
                  if (value) {
                    setCategory(value);
                  }
                }}
              >
                <SelectTrigger
                  id="receipt-category"
                  className={cn(FORM_FIELD_SELECT, PLANNER_SELECT_TRIGGER)}
                >
                  <SelectValue placeholder="Pilih kategori" />
                </SelectTrigger>
                <SelectContent className={PLANNER_SELECT_CONTENT}>
                  {categoryOptions.map((entry) => (
                    <SelectItem
                      key={entry.id}
                      value={entry.id}
                      className={PLANNER_SELECT_ITEM}
                    >
                      <span className="flex items-center gap-2">
                        <JournalCategoryIcon
                          category={entry.id}
                          type={type}
                          className="size-4"
                        />
                        {entry.label}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormDialogField>
          </div>
      </ResponsiveDialogBody>

      <ResponsiveDialogFooter>
        <Button
          type="button"
          variant="ghost"
          onClick={() => onOpenChange(false)}
          disabled={isPending}
        >
          Batal
        </Button>
        <Button
          type="button"
          onClick={handleConfirm}
          disabled={isPending || !description.trim() || previewAmount <= 0}
        >
          {isPending
            ? "Menyimpan..."
            : isEditMode
              ? "Simpan"
              : "Catat ke inbox"}
        </Button>
      </ResponsiveDialogFooter>
    </ResponsiveDialog>
  );
}
