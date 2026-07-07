"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";

import { createJournalEntryAction } from "@/app/actions/journal";
import {
  getDefaultCategoryForType,
  JournalEntryFormFields,
} from "@/components/journal/journal-entry-form-fields";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  FORM_DIALOG_BODY_SCROLL,
  FORM_DIALOG_CONTENT_WIDE,
  FORM_DIALOG_FOOTER,
  FORM_DIALOG_HEADER,
} from "@/config/form-dialog";
import { SEPARATED_CONTROL } from "@/config/shape";
import { cn } from "@/lib/utils";
import { toDateInputValue } from "@/lib/validations/planned-item";
import type { TransactionCategoryId } from "@/config/categories";
import type { TransactionType } from "@/types/transaction";

interface JournalEntryCreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function JournalEntryCreateDialog({
  open,
  onOpenChange,
}: JournalEntryCreateDialogProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [type, setType] = useState<TransactionType>("expense");
  const [category, setCategory] = useState<TransactionCategoryId>("food");
  const [occurredAtText, setOccurredAtText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [formKey, setFormKey] = useState(0);

  useEffect(() => {
    if (!open) {
      return;
    }

    setType("expense");
    setCategory(getDefaultCategoryForType("expense"));
    setOccurredAtText(toDateInputValue(new Date()));
    setError(null);
    setFormKey((current) => current + 1);
  }, [open]);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const formData = new FormData(event.currentTarget);
    formData.set("type", type);
    formData.set("category", category);

    startTransition(async () => {
      const result = await createJournalEntryAction(formData);

      if (!result.ok) {
        setError(result.error);
        return;
      }

      onOpenChange(false);
      router.refresh();
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={FORM_DIALOG_CONTENT_WIDE}>
        <DialogHeader className={FORM_DIALOG_HEADER}>
          <DialogTitle className="text-lg font-semibold tracking-tight">
            Tambah transaksi
          </DialogTitle>
          <DialogDescription className="text-[13px] leading-snug">
            Catat transaksi manual — termasuk tanggal lampau.
          </DialogDescription>
        </DialogHeader>

        <form
          className="flex min-h-0 flex-1 flex-col overflow-hidden"
          onSubmit={handleSubmit}
        >
          <div className={FORM_DIALOG_BODY_SCROLL}>
            <JournalEntryFormFields
              key={formKey}
              amountDefault=""
              category={category}
              descriptionDefault=""
              occurredAtText={occurredAtText}
              onCategoryChange={setCategory}
              onOccurredAtTextChange={setOccurredAtText}
              onTypeChange={setType}
              type={type}
            />
            {error ? (
              <p className="px-4 pt-1 text-[13px] text-destructive">{error}</p>
            ) : null}
          </div>

          <div className={FORM_DIALOG_FOOTER}>
            <Button
              type="button"
              variant="outline"
              disabled={isPending}
              className={cn(SEPARATED_CONTROL, "flex-1")}
              onClick={() => onOpenChange(false)}
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
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
