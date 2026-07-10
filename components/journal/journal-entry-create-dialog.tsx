"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";

import { createJournalEntryAction } from "@/app/actions/journal";
import {
  getDefaultCategoryForType,
  JournalEntryFormFields,
} from "@/components/journal/journal-entry-form-fields";
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
import type { TransactionCategoryId } from "@/config/categories";
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
import { cn } from "@/lib/utils";
import { todayDateInputValue } from "@/lib/validations/planned-item";
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
    setOccurredAtText(todayDateInputValue());
    setError(null);
    setFormKey((current) => current + 1);
  }, [open]);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const formData = new FormData(event.currentTarget);
    formData.set("type", type);
    formData.set("category", category);
    formData.set("occurredAt", occurredAtText);

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
            onTypeChange={setType}
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
    </ResponsiveDialog>
  );
}
