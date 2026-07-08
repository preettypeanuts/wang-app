"use client";

import { useEffect, useState, useTransition } from "react";

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
import { SAVINGS_STATUS_LABEL } from "@/config/savings";
import {
  FORM_DIALOG_BODY_SCROLL,
  FORM_FIELD_INPUT,
  FORM_FIELD_SELECT,
  FORM_GROUP,
  FORM_NOTE,
  FORM_PREVIEW_COMPACT,
  FORM_PREVIEW_COMPACT_AMOUNT,
} from "@/config/form-dialog";
import {
  PLANNER_SELECT_CONTENT,
  PLANNER_SELECT_ITEM,
  PLANNER_SELECT_TRIGGER,
} from "@/config/planner-manage";
import { SEPARATED_CONTROL } from "@/config/shape";
import { formatIdr } from "@/lib/finance/format-currency";
import { getSavingsGoalProgress } from "@/lib/finance/build-savings-overview";
import { PencilSimpleIcon, TrashIcon } from "@/lib/icons";
import { cn } from "@/lib/utils";
import type { SavingsGoalRecord, SavingsGoalStatus } from "@/types/savings-goal";

type DialogMode = "view" | "edit" | "create";

interface SavingsGoalDetailDialogProps {
  open: boolean;
  goal: SavingsGoalRecord | null;
  mode: DialogMode;
  onOpenChange: (open: boolean) => void;
  onModeChange: (mode: DialogMode) => void;
  onSubmit: (formData: FormData) => Promise<void>;
  onDelete: (goal: SavingsGoalRecord) => Promise<void>;
  onDeposit: (goal: SavingsGoalRecord, amount: number) => Promise<void>;
  onWithdraw: (goal: SavingsGoalRecord, amount: number) => Promise<void>;
}

const STATUS_OPTIONS: SavingsGoalStatus[] = ["active", "paused", "completed"];

export function SavingsGoalDetailDialog({
  open,
  goal,
  mode,
  onOpenChange,
  onModeChange,
  onSubmit,
  onDelete,
  onDeposit,
  onWithdraw,
}: SavingsGoalDetailDialogProps) {
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<SavingsGoalStatus>("active");
  const [depositAmount, setDepositAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const isForm = mode === "edit" || mode === "create";
  const title =
    mode === "create"
      ? "Tabungan baru"
      : mode === "edit"
        ? "Edit tabungan"
        : (goal?.name ?? "Detail tabungan");

  useEffect(() => {
    if (!open) {
      setDepositAmount("");
      setWithdrawAmount("");
      return;
    }

    if (goal && mode !== "create") {
      setStatus(goal.status);
      return;
    }

    setStatus("active");
  }, [open, goal, mode]);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    formData.set("status", status);

    if (goal && mode === "edit") {
      formData.set("id", goal.id);
    }

    startTransition(async () => {
      await onSubmit(formData);
    });
  }

  function handleDelete() {
    if (!goal) {
      return;
    }

    startTransition(async () => {
      await onDelete(goal);
    });
  }

  function handleDeposit() {
    if (!goal) {
      return;
    }

    const amount = Number.parseInt(depositAmount.replace(/\D/g, ""), 10);
    if (!amount || amount <= 0) {
      return;
    }

    startTransition(async () => {
      await onDeposit(goal, amount);
      setDepositAmount("");
    });
  }

  function handleWithdraw() {
    if (!goal) {
      return;
    }

    const amount = Number.parseInt(withdrawAmount.replace(/\D/g, ""), 10);
    if (!amount || amount <= 0) {
      return;
    }

    startTransition(async () => {
      await onWithdraw(goal, amount);
      setWithdrawAmount("");
    });
  }

  return (
    <ResponsiveDialog open={open} onOpenChange={onOpenChange} title={title} wide>
      <ResponsiveDialogHeader>
        <DialogTitle className="text-lg font-semibold tracking-tight">
          {title}
        </DialogTitle>
        <DialogDescription className="text-[13px] leading-snug">
          {isForm
            ? "Target tabungan untuk mengalokasikan saldo bebas."
            : "Detail tabungan, setor, atau tarik dana."}
        </DialogDescription>
      </ResponsiveDialogHeader>

      {isForm ? (
        <form
          className="flex min-h-0 flex-1 flex-col overflow-hidden"
          onSubmit={handleSubmit}
        >
          <ResponsiveDialogBody className={FORM_DIALOG_BODY_SCROLL}>
              {goal && mode === "edit" ? (
                <input type="hidden" name="id" value={goal.id} />
              ) : null}

              <div className={FORM_GROUP}>
                <FormDialogField label="Nama" htmlFor="savings-name">
                  <Input
                    id="savings-name"
                    name="name"
                    required
                    defaultValue={mode === "edit" ? (goal?.name ?? "") : ""}
                    placeholder="Contoh: Liburan"
                    className={FORM_FIELD_INPUT}
                  />
                </FormDialogField>

                <FormDialogField label="Target" htmlFor="savings-target">
                  <AmountTextInput
                    id="savings-target"
                    name="targetAmount"
                    required
                    defaultValue={
                      mode === "edit" && goal ? String(goal.targetAmount) : ""
                    }
                    placeholder="5jt"
                  />
                </FormDialogField>

                {mode === "edit" && goal ? (
                  <FormDialogField
                    label="Terkumpul"
                    htmlFor="savings-saved"
                  >
                    <AmountTextInput
                      id="savings-saved"
                      name="savedAmount"
                      defaultValue={String(goal.savedAmount)}
                      placeholder="0"
                    />
                  </FormDialogField>
                ) : (
                  <input type="hidden" name="savedAmount" value="0" />
                )}

                {mode === "edit" ? (
                  <FormDialogField label="Status" htmlFor="savings-status">
                    <Select
                      value={status}
                      onValueChange={(value) => {
                        if (value) {
                          setStatus(value as SavingsGoalStatus);
                        }
                      }}
                    >
                      <SelectTrigger
                        id="savings-status"
                        className={cn(
                          PLANNER_SELECT_TRIGGER,
                          FORM_FIELD_SELECT,
                          "text-left",
                        )}
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className={PLANNER_SELECT_CONTENT}>
                        {STATUS_OPTIONS.map((entry) => (
                          <SelectItem
                            key={entry}
                            value={entry}
                            className={PLANNER_SELECT_ITEM}
                          >
                            {SAVINGS_STATUS_LABEL[entry]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormDialogField>
                ) : (
                  <input type="hidden" name="status" value="active" />
                )}
              </div>

              <div className={FORM_GROUP}>
                <FormDialogField label="Catatan" htmlFor="savings-note">
                  <Textarea
                    id="savings-note"
                    name="note"
                    rows={3}
                    defaultValue={mode === "edit" ? (goal?.note ?? "") : ""}
                    placeholder="Opsional"
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
                if (mode === "edit" && goal) {
                  onModeChange("view");
                  return;
                }

                onOpenChange(false);
              }}
            >
              Batal
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className={cn(SEPARATED_CONTROL, "flex-1")}
            >
              {mode === "create" ? "Tambah" : "Simpan"}
            </Button>
          </ResponsiveDialogFooter>
        </form>
      ) : goal ? (
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <ResponsiveDialogBody className={FORM_DIALOG_BODY_SCROLL}>
              <div className={FORM_PREVIEW_COMPACT}>
                <div className="min-w-0">
                  <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
                    Terkumpul
                  </p>
                  <p className={cn("mt-0.5", FORM_PREVIEW_COMPACT_AMOUNT)}>
                    {formatIdr(goal.savedAmount)}
                  </p>
                </div>
                <div className="shrink-0 text-right text-[11px] leading-snug text-muted-foreground">
                  <p>Target {formatIdr(goal.targetAmount)}</p>
                  <p className="font-medium text-foreground">
                    {getSavingsGoalProgress(goal)}% ·{" "}
                    {SAVINGS_STATUS_LABEL[goal.status]}
                  </p>
                </div>
              </div>

              {goal.status === "active" ? (
                <div className={FORM_GROUP}>
                  <div className="space-y-3 px-4 py-2">
                    <FormDialogField label="Setor" htmlFor="savings-deposit">
                      <div className="flex gap-2">
                        <AmountTextInput
                          id="savings-deposit"
                          value={depositAmount}
                          onChange={(event) =>
                            setDepositAmount(event.target.value)
                          }
                          placeholder="100rb"
                          className="flex-1"
                        />
                        <Button
                          type="button"
                          disabled={isPending}
                          className={cn(SEPARATED_CONTROL, "shrink-0")}
                          onClick={handleDeposit}
                        >
                          Setor
                        </Button>
                      </div>
                    </FormDialogField>

                    <FormDialogField label="Tarik" htmlFor="savings-withdraw">
                      <div className="flex gap-2">
                        <AmountTextInput
                          id="savings-withdraw"
                          value={withdrawAmount}
                          onChange={(event) =>
                            setWithdrawAmount(event.target.value)
                          }
                          placeholder="50rb"
                          className="flex-1"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          disabled={isPending}
                          className={cn(SEPARATED_CONTROL, "shrink-0")}
                          onClick={handleWithdraw}
                        >
                          Tarik
                        </Button>
                      </div>
                    </FormDialogField>
                  </div>
                </div>
              ) : null}

              {goal.note ? (
                <div className={FORM_GROUP}>
                  <div className="px-4 py-3">
                    <p className="text-xs font-medium text-muted-foreground">
                      Catatan
                    </p>
                    <p className="mt-1 text-sm leading-relaxed text-foreground/90">
                      {goal.note}
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
                disabled={isPending}
                className={cn(SEPARATED_CONTROL, "shrink-0")}
                onClick={() => onModeChange("edit")}
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
        </div>
      ) : null}
    </ResponsiveDialog>
  );
}
