"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { JournalCategoryCombobox } from "@/components/journal/journal-category-combobox";
import { resolveCategoryForEntry } from "@/components/journal/journal-entry-form-fields";
import { PlannedItemPriorPaymentFields } from "@/components/planner/planned-item-prior-payment-fields";
import { AmountTextInput } from "@/components/shared/amount-text-input";
import { FormDatePicker } from "@/components/shared/form-date-picker";
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
import { Textarea } from "@/components/ui/textarea";
import {
  formatPayPlanPaidFraction,
  PAYPLAN_LABEL_ADD_PAY_PLAN,
  PAYPLAN_LABEL_AMOUNT,
  PAYPLAN_LABEL_AUTO_PAID_OFF,
  PAYPLAN_LABEL_DATE,
  PAYPLAN_LABEL_EDIT_PAY_PLAN,
  PAYPLAN_LABEL_END_MODE_ARIA,
  PAYPLAN_LABEL_ENDS,
  PAYPLAN_LABEL_ESTIMATED_PAYOFF,
  PAYPLAN_LABEL_FILL_TOTAL_INSTALLMENT,
  PAYPLAN_LABEL_FOREVER,
  PAYPLAN_LABEL_INSTALLMENT_COUNT,
  PAYPLAN_LABEL_INSTALLMENT_PER_MONTH,
  PAYPLAN_LABEL_KIND,
  PAYPLAN_LABEL_LIMITED,
  PAYPLAN_LABEL_MANUAL_DATE,
  PAYPLAN_LABEL_NAME,
  PAYPLAN_LABEL_NEW_PAY_PLAN,
  PAYPLAN_LABEL_NOTE,
  PAYPLAN_LABEL_NOTE_OPTIONAL,
  PAYPLAN_LABEL_OCCURRENCE_COUNT,
  PAYPLAN_LABEL_PAY_PLAN_FORM_DESC,
  PAYPLAN_LABEL_PAYOFF_DATE,
  PAYPLAN_LABEL_PAYOFF_DATE_MODE_ARIA,
  PAYPLAN_LABEL_REPEAT,
  PAYPLAN_LABEL_SAVING,
  PAYPLAN_LABEL_START,
  PAYPLAN_LABEL_START_PAYING,
  PAYPLAN_LABEL_TOTAL_INSTALLMENT,
  PAYPLAN_LABEL_TOTAL_LOAN,
  UI_LABEL_CANCEL,
  UI_LABEL_CATEGORY,
  UI_LABEL_SAVE,
} from "@/config/payplan-labels";
import {
  FORM_DIALOG_BODY_SCROLL,
  FORM_FIELD_GRID_ROW,
  FORM_FIELD_INPUT,
  FORM_FIELD_SELECT,
  FORM_GROUP,
  FORM_GROUP_DIVIDER,
  FORM_NOTE,
  FORM_PREVIEW_COMPACT,
  FORM_PREVIEW_COMPACT_AMOUNT,
  FORM_SEGMENT,
  FORM_SEGMENT_ACTIVE,
  FORM_SEGMENT_INACTIVE,
  FORM_SEGMENTED,
} from "@/config/form-dialog";
import {
  getDefaultCategoryForKind,
  getFlowTypeForKind,
  getPlannedKindLabel,
  getPlannedRepeatLabel,
  PLANNED_ITEM_KINDS,
  PLANNED_REPEAT_INTERVALS,
} from "@/config/planner-items";
import {
  PLANNER_SELECT_CONTENT,
  PLANNER_SELECT_ITEM,
  PLANNER_SELECT_TRIGGER,
} from "@/config/planner-manage";
import { SEPARATED_CONTROL } from "@/config/shape";
import { parseDateOnlyInput } from "@/lib/finance/day-range";
import { formatIdr } from "@/lib/finance/format-currency";
import { formatFullPayoffDate } from "@/lib/finance/format-datetime";
import { parseAmount } from "@/lib/finance/parse-amount";
import { computeInstallmentScheduleFromAmounts } from "@/lib/planner/installment-progress";
import { cn } from "@/lib/utils";
import {
  getPlannedItemEndMode,
  isValidDateInput,
  toDateInputValue,
  todayDateInputValue,
} from "@/lib/validations/planned-item";
import type {
  PlannedEndMode,
  PlannedItemKind,
  PlannedItemRecord,
  PlannedRepeatInterval,
} from "@/types/planner";

interface PlannedItemFormDialogProps {
  open: boolean;
  item: PlannedItemRecord | null;
  defaultStartAt?: string;
  onOpenChange: (open: boolean) => void;
  onSubmit: (formData: FormData) => Promise<boolean>;
}

function formatScheduleEndLabel(
  value: Date | string | null | undefined,
): string | null {
  return formatFullPayoffDate(value);
}

function getInitialAmountDraft(item: PlannedItemRecord | null): string {
  return item ? String(item.amount) : "";
}

function getInitialTotalDraft(item: PlannedItemRecord | null): string {
  if (item?.kind === "installment" && item.installmentCount) {
    return String(item.amount * item.installmentCount);
  }

  return "";
}

type InstallmentEndDateMode = "auto" | "manual";

export function PlannedItemFormDialog({
  open,
  item,
  defaultStartAt,
  onOpenChange,
  onSubmit,
}: PlannedItemFormDialogProps) {
  const [isPending, startTransition] = useTransition();
  const [kind, setKind] = useState<PlannedItemKind>("bill");
  const [repeat, setRepeat] = useState<PlannedRepeatInterval>("monthly");
  const [category, setCategory] = useState<string>("housing");
  const [endMode, setEndMode] = useState<PlannedEndMode>("never");
  const [amountDraft, setAmountDraft] = useState("");
  const [totalDraft, setTotalDraft] = useState("");
  const [startAtText, setStartAtText] = useState("");
  const [endAtText, setEndAtText] = useState("");
  const [endDateMode, setEndDateMode] =
    useState<InstallmentEndDateMode>("auto");
  const [isNewInstallment, setIsNewInstallment] = useState(true);
  const [paidPriorCount, setPaidPriorCount] = useState("0");
  const wasOpenRef = useRef(false);
  const [formSession, setFormSession] = useState(0);

  const isInstallmentKind = kind === "installment";
  const flowType = getFlowTypeForKind(kind);

  const fallbackStartAt = useMemo(
    () => defaultStartAt ?? todayDateInputValue(),
    [defaultStartAt],
  );

  const installmentSchedule = useMemo(() => {
    if (!isInstallmentKind) {
      return null;
    }

    const totalAmount = parseAmount(totalDraft);
    const paymentAmount = parseAmount(amountDraft);
    if (!totalAmount || !paymentAmount || !isValidDateInput(startAtText)) {
      return null;
    }

    if (paymentAmount >= totalAmount) {
      return null;
    }

    const startDate = parseDateOnlyInput(startAtText);
    if (!startDate) {
      return null;
    }

    return computeInstallmentScheduleFromAmounts(
      startDate,
      repeat,
      totalAmount,
      paymentAmount,
    );
  }, [amountDraft, isInstallmentKind, repeat, startAtText, totalDraft]);

  const installmentEndLabel = useMemo(() => {
    if (isValidDateInput(endAtText)) {
      return formatScheduleEndLabel(endAtText);
    }

    if (!installmentSchedule?.endAt) {
      return null;
    }

    return formatScheduleEndLabel(installmentSchedule.endAt);
  }, [endAtText, installmentSchedule]);

  const previewAmount = useMemo(() => {
    if (isInstallmentKind) {
      const total = parseAmount(totalDraft);
      if (total) {
        return total;
      }
    }

    return parseAmount(amountDraft) ?? item?.amount ?? 0;
  }, [amountDraft, isInstallmentKind, item?.amount, totalDraft]);

  useEffect(() => {
    const justOpened = open && !wasOpenRef.current;
    wasOpenRef.current = open;

    if (!justOpened) {
      return;
    }

    setFormSession((current) => current + 1);

    if (item) {
      setKind(item.kind);
      setRepeat(item.repeat);
      setCategory(
        resolveCategoryForEntry(
          item.flowType,
          item.category,
        ),
      );
      setEndMode(getPlannedItemEndMode(item));
      setAmountDraft(getInitialAmountDraft(item));
      setTotalDraft(getInitialTotalDraft(item));
      setStartAtText(toDateInputValue(item.startAt));
      setEndAtText(item.endAt ? toDateInputValue(item.endAt) : "");
      if (item.kind === "installment" && item.endAt) {
        const computed = computeInstallmentScheduleFromAmounts(
          item.startAt,
          item.repeat,
          item.amount * (item.installmentCount ?? 1),
          item.amount,
        );
        const savedEnd = toDateInputValue(item.endAt);
        const computedEnd = computed ? toDateInputValue(computed.endAt) : null;
        setEndDateMode(savedEnd !== computedEnd ? "manual" : "auto");
      } else {
        setEndDateMode("auto");
      }
      setIsNewInstallment(item.paidInstallmentCount === 0);
      setPaidPriorCount(String(item.paidInstallmentCount));
      return;
    }

    setKind("bill");
    setRepeat("monthly");
    setCategory(getDefaultCategoryForKind("bill"));
    setEndMode("never");
    setAmountDraft("");
    setTotalDraft("");
    setStartAtText(fallbackStartAt);
    setEndAtText("");
    setEndDateMode("auto");
    setIsNewInstallment(true);
    setPaidPriorCount("0");
  }, [fallbackStartAt, item, open]);

  useEffect(() => {
    if (!isInstallmentKind || endDateMode !== "auto" || !installmentSchedule) {
      return;
    }

    const nextEndAt = toDateInputValue(installmentSchedule.endAt);
    setEndAtText((current) => (current === nextEndAt ? current : nextEndAt));
  }, [endDateMode, installmentSchedule, isInstallmentKind]);

  useEffect(() => {
    if (!isInstallmentKind || endMode === "installments") {
      return;
    }

    setEndMode("installments");
  }, [endMode, isInstallmentKind]);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    formData.set("kind", kind);
    formData.set("repeat", repeat);
    formData.set("category", category);
    formData.set("endMode", isInstallmentKind ? "installments" : endMode);

    if (isInstallmentKind && installmentSchedule) {
      formData.set(
        "installmentCount",
        String(installmentSchedule.installmentCount),
      );
      formData.set("endAt", endAtText);
      formData.set("installmentIsNew", isNewInstallment ? "on" : "off");
      if (!isNewInstallment) {
        formData.set("paidInstallmentCount", paidPriorCount);
      }
    }

    startTransition(async () => {
      const ok = await onSubmit(formData);
      if (ok) {
        onOpenChange(false);
      }
    });
  }

  const paidPriorValid = useMemo(() => {
    if (!isInstallmentKind || isNewInstallment) {
      return true;
    }

    const paid = Number.parseInt(paidPriorCount, 10);
    if (!Number.isFinite(paid) || paid < 0) {
      return false;
    }

    if (!installmentSchedule) {
      return true;
    }

    return paid < installmentSchedule.installmentCount;
  }, [
    installmentSchedule,
    isInstallmentKind,
    isNewInstallment,
    paidPriorCount,
  ]);

  const amountDefaultValue = getInitialAmountDraft(item);
  const totalDefaultValue = getInitialTotalDraft(item);
  const nameDefaultValue = item?.name ?? "";
  const noteDefaultValue = item?.note ?? "";

  const dialogTitle = item ? PAYPLAN_LABEL_EDIT_PAY_PLAN : PAYPLAN_LABEL_NEW_PAY_PLAN;

  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={onOpenChange}
      title={dialogTitle}
      wide
    >
      <ResponsiveDialogHeader>
        <DialogTitle className="text-lg font-semibold tracking-tight">
          {dialogTitle}
        </DialogTitle>
        <DialogDescription className="text-[13px] leading-snug">
          {PAYPLAN_LABEL_PAY_PLAN_FORM_DESC}
        </DialogDescription>
      </ResponsiveDialogHeader>

      <form
        className="flex min-h-0 flex-1 flex-col overflow-hidden"
        onSubmit={handleSubmit}
      >
        <ResponsiveDialogBody className={FORM_DIALOG_BODY_SCROLL}>
          {item ? <input type="hidden" name="id" value={item.id} /> : null}

          <div className={FORM_PREVIEW_COMPACT}>
            <div className="min-w-0">
              <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
                {isInstallmentKind
                  ? PAYPLAN_LABEL_TOTAL_INSTALLMENT
                  : PAYPLAN_LABEL_AMOUNT}
              </p>
              <p className={cn("mt-0.5", FORM_PREVIEW_COMPACT_AMOUNT)}>
                {formatIdr(previewAmount)}
              </p>
            </div>
            <div className="shrink-0 text-right text-[11px] leading-snug text-muted-foreground">
              <p>{getPlannedKindLabel(kind)}</p>
              <p>
                {getPlannedRepeatLabel(repeat)}
                {installmentSchedule
                  ? ` · ${installmentSchedule.installmentCount}x`
                  : null}
              </p>
              {isInstallmentKind &&
              installmentSchedule &&
              !isNewInstallment &&
              Number.isFinite(Number.parseInt(paidPriorCount, 10)) ? (
                <p className="mt-1 font-medium text-foreground">
                  {formatPayPlanPaidFraction(
                    Number.parseInt(paidPriorCount, 10),
                    installmentSchedule.installmentCount,
                  )}
                </p>
              ) : null}
              {installmentEndLabel ? (
                <p className="mt-1 font-medium capitalize text-[#007AFF]">
                  {installmentEndLabel}
                </p>
              ) : null}
            </div>
          </div>

          <div className={FORM_GROUP}>
            <FormDialogField label={PAYPLAN_LABEL_NAME} htmlFor="planned-name">
              <Input
                key={`name-${formSession}`}
                id="planned-name"
                name="name"
                defaultValue={nameDefaultValue}
                placeholder="MacBook, Netflix"
                required
                className={FORM_FIELD_INPUT}
              />
            </FormDialogField>

            <FormDialogField label={UI_LABEL_CATEGORY} htmlFor="planned-category">
              <JournalCategoryCombobox
                id="planned-category"
                type={flowType}
                value={category}
                onChange={setCategory}
              />
            </FormDialogField>

            {!isInstallmentKind ? (
              <div className={FORM_FIELD_GRID_ROW}>
                <FormDialogField label={PAYPLAN_LABEL_KIND} htmlFor="planned-kind" gridItem>
                  <Select
                    value={kind}
                    onValueChange={(value) => {
                      if (value) {
                        const nextKind = value as PlannedItemKind;
                        setKind(nextKind);
                        setCategory(
                          getDefaultCategoryForKind(
                            nextKind,
                          ),
                        );
                        if (nextKind === "installment") {
                          setEndMode("installments");
                          setRepeat("monthly");
                          setEndDateMode("auto");
                        }
                      }
                    }}
                  >
                    <SelectTrigger
                      id="planned-kind"
                      className={cn(
                        PLANNER_SELECT_TRIGGER,
                        FORM_FIELD_SELECT,
                        "text-left",
                      )}
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className={PLANNER_SELECT_CONTENT}>
                      {PLANNED_ITEM_KINDS.map((entry) => (
                        <SelectItem
                          key={entry.value}
                          value={entry.value}
                          className={PLANNER_SELECT_ITEM}
                        >
                          {entry.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormDialogField>

                <FormDialogField
                  label={PAYPLAN_LABEL_REPEAT}
                  htmlFor="planned-repeat"
                  gridItem
                >
                  <Select
                    value={repeat}
                    onValueChange={(value) => {
                      if (value) {
                        setRepeat(value as PlannedRepeatInterval);
                      }
                    }}
                  >
                    <SelectTrigger
                      id="planned-repeat"
                      className={cn(
                        PLANNER_SELECT_TRIGGER,
                        FORM_FIELD_SELECT,
                        "text-left",
                      )}
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className={PLANNER_SELECT_CONTENT}>
                      {PLANNED_REPEAT_INTERVALS.map((entry) => (
                        <SelectItem
                          key={entry.value}
                          value={entry.value}
                          className={PLANNER_SELECT_ITEM}
                        >
                          {entry.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormDialogField>
              </div>
            ) : (
              <FormDialogField label={PAYPLAN_LABEL_KIND} htmlFor="planned-kind-installment">
                <Select
                  value={kind}
                  onValueChange={(value) => {
                    if (value) {
                      const nextKind = value as PlannedItemKind;
                      setKind(nextKind);
                      setCategory(
                        getDefaultCategoryForKind(
                          nextKind,
                        ),
                      );
                      if (nextKind === "installment") {
                        setEndMode("installments");
                        setRepeat("monthly");
                        setEndDateMode("auto");
                      }
                    }
                  }}
                >
                  <SelectTrigger
                    id="planned-kind-installment"
                    className={cn(
                      PLANNER_SELECT_TRIGGER,
                      FORM_FIELD_SELECT,
                      "text-left",
                    )}
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className={PLANNER_SELECT_CONTENT}>
                    {PLANNED_ITEM_KINDS.map((entry) => (
                      <SelectItem
                        key={entry.value}
                        value={entry.value}
                        className={PLANNER_SELECT_ITEM}
                      >
                        {entry.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormDialogField>
            )}

            {isInstallmentKind ? (
              <>
                <div className={FORM_FIELD_GRID_ROW}>
                  <FormDialogField
                    label={PAYPLAN_LABEL_TOTAL_LOAN}
                    htmlFor="planned-total"
                    gridItem
                  >
                    <AmountTextInput
                      key={`total-${formSession}`}
                      id="planned-total"
                      name="installmentTotal"
                      defaultValue={totalDraft || totalDefaultValue}
                      onInput={(event) => {
                        setEndDateMode("auto");
                        setTotalDraft(event.currentTarget.value);
                      }}
                      placeholder="20jt"
                      required
                    />
                  </FormDialogField>

                  <FormDialogField
                    label={PAYPLAN_LABEL_INSTALLMENT_PER_MONTH}
                    htmlFor="planned-amount"
                    gridItem
                  >
                    <AmountTextInput
                      key={`amount-${formSession}`}
                      id="planned-amount"
                      name="amount"
                      defaultValue={amountDraft || amountDefaultValue}
                      onInput={(event) => {
                        setEndDateMode("auto");
                        setAmountDraft(event.currentTarget.value);
                      }}
                      placeholder="5jt"
                      required
                    />
                  </FormDialogField>
                </div>

                <div className={FORM_FIELD_GRID_ROW}>
                  <FormDialogField
                    label={PAYPLAN_LABEL_START_PAYING}
                    htmlFor="planned-start"
                    gridItem
                  >
                    <FormDatePicker
                      id="planned-start"
                      name="startAt"
                      value={startAtText}
                      onChange={(nextValue) => {
                        setEndDateMode("auto");
                        setStartAtText(nextValue);
                      }}
                      required
                    />
                  </FormDialogField>

                  <FormDialogField label={PAYPLAN_LABEL_INSTALLMENT_COUNT} gridItem>
                    <p className="flex h-10 items-center text-sm font-semibold tabular-nums">
                      {installmentSchedule
                        ? `${installmentSchedule.installmentCount}x`
                        : "—"}
                    </p>
                  </FormDialogField>
                </div>

                <PlannedItemPriorPaymentFields
                  isNewFromStart={isNewInstallment}
                  paidPriorCount={paidPriorCount}
                  maxInstallments={
                    installmentSchedule?.installmentCount ?? null
                  }
                  onIsNewFromStartChange={setIsNewInstallment}
                  onPaidPriorCountChange={setPaidPriorCount}
                />
              </>
            ) : (
              <div className={FORM_FIELD_GRID_ROW}>
                <FormDialogField
                  label={PAYPLAN_LABEL_AMOUNT}
                  htmlFor="planned-amount-other"
                  gridItem
                >
                  <AmountTextInput
                    key={`amount-${formSession}`}
                    id="planned-amount-other"
                    name="amount"
                    defaultValue={amountDraft || amountDefaultValue}
                    onInput={(event) => {
                      setAmountDraft(event.currentTarget.value);
                    }}
                    placeholder="69K"
                    required
                  />
                </FormDialogField>

                <FormDialogField
                  label={PAYPLAN_LABEL_START}
                  htmlFor="planned-start-other"
                  gridItem
                >
                  <FormDatePicker
                    id="planned-start-other"
                    name="startAt"
                    value={startAtText}
                    onChange={setStartAtText}
                    required
                  />
                </FormDialogField>
              </div>
            )}
          </div>

          {isInstallmentKind ? (
            <>
              <div
                className={FORM_SEGMENTED}
                role="tablist"
                aria-label={PAYPLAN_LABEL_PAYOFF_DATE_MODE_ARIA}
              >
                <button
                  type="button"
                  role="tab"
                  aria-selected={endDateMode === "auto"}
                  onClick={() => setEndDateMode("auto")}
                  className={cn(
                    FORM_SEGMENT,
                    endDateMode === "auto"
                      ? FORM_SEGMENT_ACTIVE
                      : FORM_SEGMENT_INACTIVE,
                  )}
                >
                  {PAYPLAN_LABEL_AUTO_PAID_OFF}
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={endDateMode === "manual"}
                  onClick={() => {
                    if (installmentSchedule && !isValidDateInput(endAtText)) {
                      setEndAtText(toDateInputValue(installmentSchedule.endAt));
                    }
                    setEndDateMode("manual");
                  }}
                  className={cn(
                    FORM_SEGMENT,
                    endDateMode === "manual"
                      ? FORM_SEGMENT_ACTIVE
                      : FORM_SEGMENT_INACTIVE,
                  )}
                >
                  {PAYPLAN_LABEL_MANUAL_DATE}
                </button>
              </div>

              <div className={FORM_GROUP}>
                {endDateMode === "auto" ? (
                  <div className="px-4 py-3">
                    <p className="text-xs font-medium text-muted-foreground">
                      {PAYPLAN_LABEL_ESTIMATED_PAYOFF}
                    </p>
                    {installmentEndLabel ? (
                      <>
                        <p className="mt-1 text-sm font-semibold capitalize leading-snug">
                          {installmentEndLabel}
                        </p>
                        {isValidDateInput(endAtText) ? (
                          <p className="mt-0.5 text-[11px] tabular-nums text-muted-foreground">
                            {endAtText}
                          </p>
                        ) : null}
                      </>
                    ) : (
                      <p className="mt-1 text-sm text-muted-foreground">
                        {PAYPLAN_LABEL_FILL_TOTAL_INSTALLMENT}
                      </p>
                    )}
                  </div>
                ) : (
                  <FormDialogField
                    label={PAYPLAN_LABEL_PAYOFF_DATE}
                    htmlFor="planned-end-date"
                  >
                    <FormDatePicker
                      id="planned-end-date"
                      name="endAt"
                      value={endAtText}
                      onChange={setEndAtText}
                      required
                    />
                  </FormDialogField>
                )}
                {endDateMode === "auto" && isValidDateInput(endAtText) ? (
                  <input type="hidden" name="endAt" value={endAtText} />
                ) : null}
              </div>
            </>
          ) : null}

          {!isInstallmentKind ? (
            <>
              <div
                className={FORM_SEGMENTED}
                role="tablist"
                aria-label={PAYPLAN_LABEL_END_MODE_ARIA}
              >
                <button
                  type="button"
                  role="tab"
                  aria-selected={endMode === "never"}
                  onClick={() => setEndMode("never")}
                  className={cn(
                    FORM_SEGMENT,
                    endMode === "never"
                      ? FORM_SEGMENT_ACTIVE
                      : FORM_SEGMENT_INACTIVE,
                  )}
                >
                  {PAYPLAN_LABEL_FOREVER}
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={endMode === "installments"}
                  onClick={() => setEndMode("installments")}
                  className={cn(
                    FORM_SEGMENT,
                    endMode === "installments"
                      ? FORM_SEGMENT_ACTIVE
                      : FORM_SEGMENT_INACTIVE,
                  )}
                >
                  {PAYPLAN_LABEL_LIMITED}
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={endMode === "date"}
                  onClick={() => setEndMode("date")}
                  className={cn(
                    FORM_SEGMENT,
                    endMode === "date"
                      ? FORM_SEGMENT_ACTIVE
                      : FORM_SEGMENT_INACTIVE,
                  )}
                >
                  {PAYPLAN_LABEL_DATE}
                </button>
              </div>

              {endMode === "installments" ? (
                <div className={FORM_GROUP}>
                  <FormDialogField
                    label={PAYPLAN_LABEL_OCCURRENCE_COUNT}
                    htmlFor="planned-installments"
                  >
                    <Input
                      key={`installments-${formSession}`}
                      id="planned-installments"
                      name="installmentCount"
                      type="number"
                      min={1}
                      defaultValue={item?.installmentCount ?? 12}
                      required
                      className={FORM_FIELD_INPUT}
                    />
                  </FormDialogField>
                </div>
              ) : null}

              {endMode === "date" ? (
                <div className={FORM_GROUP}>
                  <FormDialogField
                    label={PAYPLAN_LABEL_ENDS}
                    htmlFor="planned-end-date-other"
                  >
                    <FormDatePicker
                      id="planned-end-date-other"
                      name="endAt"
                      value={endAtText || fallbackStartAt}
                      onChange={setEndAtText}
                      required
                    />
                  </FormDialogField>
                </div>
              ) : null}
            </>
          ) : null}

          <div className={FORM_GROUP}>
            <FormDialogField label={PAYPLAN_LABEL_NOTE} htmlFor="planned-note">
              <Textarea
                key={`note-${formSession}`}
                id="planned-note"
                name="note"
                defaultValue={noteDefaultValue}
                rows={2}
                placeholder={PAYPLAN_LABEL_NOTE_OPTIONAL}
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
            onClick={() => onOpenChange(false)}
          >
            {UI_LABEL_CANCEL}
          </Button>
          <Button
            type="submit"
            disabled={
              isPending ||
              (isInstallmentKind &&
                (!installmentSchedule ||
                  !isValidDateInput(endAtText) ||
                  !paidPriorValid))
            }
            className={cn(SEPARATED_CONTROL, "flex-1")}
          >
            {isPending
              ? PAYPLAN_LABEL_SAVING
              : item
                ? UI_LABEL_SAVE
                : PAYPLAN_LABEL_ADD_PAY_PLAN}
          </Button>
        </ResponsiveDialogFooter>
      </form>
    </ResponsiveDialog>
  );
}
