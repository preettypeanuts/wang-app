"use client";

import { useEffect, useState, useTransition } from "react";

import { PlanMarkPurchasedSection } from "@/components/plans/plan-mark-purchased-section";
import { PlanPurchasedNotice } from "@/components/plans/plan-purchased-notice";
import { AmountTextInput } from "@/components/shared/amount-text-input";
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
import { Textarea } from "@/components/ui/textarea";
import { TRANSACTION_CATEGORIES, getCategoryLabel } from "@/config/categories";
import {
  PLANS_LABEL_NAME,
  PLANS_LABEL_NOTE_OPTIONAL,
  PLANS_WISH_DETAIL_FALLBACK,
  PLANS_WISH_EDIT_TITLE,
  PLANS_WISH_FORM_DESC,
  PLANS_WISH_NAME_PLACEHOLDER,
  PLANS_WISH_NEW_TITLE,
  PLANS_WISH_PRICE_ESTIMATE,
  PLANS_WISH_VIEW_DESC,
  UI_LABEL_ADD,
  UI_LABEL_CANCEL,
  UI_LABEL_CATEGORY,
  UI_LABEL_CLOSE,
  UI_LABEL_DELETE,
  UI_LABEL_EDIT,
  UI_LABEL_NOTE,
  UI_LABEL_SAVE,
} from "@/config/plans-labels";
import { UI_LABEL_ESTIMATE } from "@/config/ui-labels";
import {
  FORM_DIALOG_BODY_SCROLL,
  FORM_FIELD_INPUT,
  FORM_FIELD_SELECT,
  FORM_GROUP,
  FORM_NOTE,
  FORM_PREVIEW_COMPACT,
  FORM_PREVIEW_COMPACT_AMOUNT,
} from "@/config/form-dialog";
import { PLAN_STATUS_LABEL } from "@/config/plans";
import {
  PLANNER_SELECT_CONTENT,
  PLANNER_SELECT_ITEM,
  PLANNER_SELECT_TRIGGER,
} from "@/config/planner-manage";
import { SEPARATED_CONTROL } from "@/config/shape";
import { formatIdr } from "@/lib/finance/format-currency";
import { cn } from "@/lib/utils";
import type { PlanRecord } from "@/types/plan";
import { PencilSimpleIcon, TrashIcon } from "@/lib/icons";

type DialogMode = "view" | "edit" | "create";

interface PlanDetailDialogProps {
  open: boolean;
  plan: PlanRecord | null;
  mode: DialogMode;
  onOpenChange: (open: boolean) => void;
  onModeChange: (mode: DialogMode) => void;
  onSubmit: (formData: FormData) => Promise<void>;
  onDelete: (plan: PlanRecord) => Promise<void>;
  onMarkPurchased: (plan: PlanRecord) => Promise<void>;
}

const EXPENSE_CATEGORIES = TRANSACTION_CATEGORIES.filter(
  (category) =>
    category.id !== "salary" &&
    category.id !== "side_income" &&
    category.id !== "other",
);

export function PlanDetailDialog({
  open,
  plan,
  mode,
  onOpenChange,
  onModeChange,
  onSubmit,
  onDelete,
  onMarkPurchased,
}: PlanDetailDialogProps) {
  const [isPending, startTransition] = useTransition();
  const [category, setCategory] = useState("shopping");
  const isForm = mode === "edit" || mode === "create";
  const title =
    mode === "create"
      ? PLANS_WISH_NEW_TITLE
      : mode === "edit"
        ? PLANS_WISH_EDIT_TITLE
        : (plan?.name ?? PLANS_WISH_DETAIL_FALLBACK);

  useEffect(() => {
    if (!open) {
      return;
    }

    if (plan && mode !== "create") {
      setCategory(plan.category);
      return;
    }

    setCategory("shopping");
  }, [open, plan, mode]);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    formData.set("category", category);
    formData.set("status", plan?.status ?? "active");

    if (plan && mode === "edit") {
      formData.set("id", plan.id);
    }

    startTransition(async () => {
      await onSubmit(formData);
    });
  }

  function handleDelete() {
    if (!plan) {
      return;
    }

    startTransition(async () => {
      await onDelete(plan);
    });
  }

  function handleMarkPurchased() {
    if (!plan) {
      return;
    }

    startTransition(async () => {
      await onMarkPurchased(plan);
    });
  }

  return (
    <ResponsiveDialog open={open} onOpenChange={onOpenChange} title={title} wide>
      <ResponsiveDialogHeader>
        <DialogTitle className="text-lg font-semibold tracking-tight">
          {title}
        </DialogTitle>
        <DialogDescription className="text-[13px] leading-snug">
          {isForm ? PLANS_WISH_FORM_DESC : PLANS_WISH_VIEW_DESC}
        </DialogDescription>
      </ResponsiveDialogHeader>

      {isForm ? (
        <form
          className="flex min-h-0 flex-1 flex-col overflow-hidden"
          onSubmit={handleSubmit}
        >
          <ResponsiveDialogBody className={FORM_DIALOG_BODY_SCROLL}>
              {plan && mode === "edit" ? (
                <input type="hidden" name="id" value={plan.id} />
              ) : null}

              <div className={FORM_GROUP}>
                <FormDialogField label={PLANS_LABEL_NAME} htmlFor="plan-name">
                  <Input
                    id="plan-name"
                    name="name"
                    required
                    defaultValue={mode === "edit" ? (plan?.name ?? "") : ""}
                    placeholder={PLANS_WISH_NAME_PLACEHOLDER}
                    className={FORM_FIELD_INPUT}
                  />
                </FormDialogField>

                <FormDialogField label={PLANS_WISH_PRICE_ESTIMATE} htmlFor="plan-amount">
                  <AmountTextInput
                    id="plan-amount"
                    name="amount"
                    required
                    defaultValue={
                      mode === "edit" && plan ? String(plan.amount) : ""
                    }
                    placeholder="15jt"
                  />
                </FormDialogField>

                <FormDialogField label={UI_LABEL_CATEGORY} htmlFor="plan-category">
                  <Select
                    value={category}
                    onValueChange={(value) => {
                      if (value) {
                        setCategory(value);
                      }
                    }}
                  >
                    <SelectTrigger
                      id="plan-category"
                      className={cn(
                        PLANNER_SELECT_TRIGGER,
                        FORM_FIELD_SELECT,
                        "text-left",
                      )}
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className={PLANNER_SELECT_CONTENT}>
                      {EXPENSE_CATEGORIES.map((entry) => (
                        <SelectItem
                          key={entry.id}
                          value={entry.id}
                          className={PLANNER_SELECT_ITEM}
                        >
                          {entry.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormDialogField>

                {plan ? (
                  <input type="hidden" name="status" value={plan.status} />
                ) : (
                  <input type="hidden" name="status" value="active" />
                )}
              </div>

              <div className={FORM_GROUP}>
                <FormDialogField label={UI_LABEL_NOTE} htmlFor="plan-note">
                  <Textarea
                    id="plan-note"
                    name="note"
                    rows={3}
                    defaultValue={mode === "edit" ? (plan?.note ?? "") : ""}
                    placeholder={PLANS_LABEL_NOTE_OPTIONAL}
                    className={FORM_NOTE}
                  />
                </FormDialogField>
              </div>
          </ResponsiveDialogBody>

          <ResponsiveDialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={isPending}
              className={cn(SEPARATED_CONTROL, "flex-1")}
              onClick={() => {
                if (mode === "edit" && plan) {
                  onModeChange("view");
                  return;
                }

                onOpenChange(false);
              }}
            >
              {UI_LABEL_CANCEL}
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className={cn(SEPARATED_CONTROL, "flex-1")}
            >
              {mode === "create" ? UI_LABEL_ADD : UI_LABEL_SAVE}
            </Button>
          </ResponsiveDialogFooter>
        </form>
      ) : plan ? (
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <ResponsiveDialogBody className={FORM_DIALOG_BODY_SCROLL}>
              <div className={FORM_PREVIEW_COMPACT}>
                <div className="min-w-0">
                  <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
                    {UI_LABEL_ESTIMATE}
                  </p>
                  <p className={cn("mt-0.5", FORM_PREVIEW_COMPACT_AMOUNT)}>
                    {formatIdr(plan.amount)}
                  </p>
                </div>
                <div className="shrink-0 text-right text-[11px] leading-snug text-muted-foreground">
                  <p>{getCategoryLabel(plan.category)}</p>
                  <p className="font-medium text-foreground">
                    {PLAN_STATUS_LABEL[plan.status]}
                  </p>
                </div>
              </div>

              {plan.status === "active" ? (
                <div className="pb-1">
                  <PlanMarkPurchasedSection
                    amount={plan.amount}
                    disabled={isPending}
                    onMarkPurchased={handleMarkPurchased}
                  />
                </div>
              ) : (
                <div className="px-4 pb-1">
                  <PlanPurchasedNotice amount={plan.amount} />
                </div>
              )}

              {plan.note ? (
                <div className={FORM_GROUP}>
                  <div className="px-4 py-3">
                    <p className="text-xs font-medium text-muted-foreground">
                      {UI_LABEL_NOTE}
                    </p>
                    <p className="mt-1 text-sm leading-relaxed text-foreground/90">
                      {plan.note}
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
              disabled={isPending}
              className={cn(SEPARATED_CONTROL, "shrink-0")}
              onClick={handleDelete}
              aria-label={UI_LABEL_DELETE}
            >
              <span className="sr-only">{UI_LABEL_DELETE}</span>
              <TrashIcon className="size-4" />
            </Button>
            <div className="flex min-w-0 flex-1 gap-2">
              <Button
                type="button"
                size="icon"
                variant="outline"
                disabled={isPending}
                className={cn(SEPARATED_CONTROL, "shrink-0")}
                onClick={() => onModeChange("edit")}
                aria-label={UI_LABEL_EDIT}
              >
                <span className="sr-only">{UI_LABEL_EDIT}</span>
                <PencilSimpleIcon className="size-4" />
              </Button>

              <Button
                type="button"
                disabled={isPending}
                className={cn(SEPARATED_CONTROL, "flex-1")}
                onClick={() => onOpenChange(false)}
              >
                {UI_LABEL_CLOSE}
              </Button>
            </div>
          </ResponsiveDialogFooter>
        </div>
      ) : null}
    </ResponsiveDialog>
  );
}
