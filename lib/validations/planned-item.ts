import {
  parseDateOnlyInput,
  toDayKey,
  todayDateInputValue,
} from "@/lib/finance/day-range";
import { parseAmount } from "@/lib/finance/parse-amount";
import { computeInstallmentScheduleFromAmounts } from "@/lib/planner/installment-progress";
import type {
  PlannedEndMode,
  PlannedItemFormInput,
  PlannedItemKind,
  PlannedItemRecord,
  PlannedRepeatInterval,
} from "@/types/planner";

const PLANNED_ITEM_KINDS = new Set<PlannedItemKind>([
  "bill",
  "subscription",
  "installment",
  "income",
]);

const PLANNED_REPEAT_INTERVALS = new Set<PlannedRepeatInterval>([
  "monthly",
  "weekly",
  "yearly",
]);

const PLANNED_END_MODES = new Set<PlannedEndMode>([
  "never",
  "installments",
  "date",
]);

function readString(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function parseNonNegativeInteger(value: string): number | null {
  if (!value.trim()) {
    return 0;
  }

  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed < 0) {
    return null;
  }

  return parsed;
}

function parsePositiveInteger(value: string): number | null {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return null;
  }

  return parsed;
}

function parseDateInput(value: string): string | null {
  return parseDateOnlyInput(value) ? value : null;
}

export function isValidDateInput(value: string): boolean {
  return parseDateInput(value) !== null;
}

export function parsePlannedItemFormData(
  formData: FormData,
): { ok: true; data: PlannedItemFormInput } | { ok: false; error: string } {
  const name = readString(formData, "name");
  const kind = readString(formData, "kind") as PlannedItemKind;
  const repeat = readString(formData, "repeat") as PlannedRepeatInterval;
  const endMode = readString(formData, "endMode") as PlannedEndMode;
  const startAt = parseDateInput(readString(formData, "startAt"));
  const amountText = readString(formData, "amount");
  const amount = parseAmount(amountText);
  const note = readString(formData, "note");

  if (!name) {
    return { ok: false, error: "Nama wajib diisi." };
  }

  if (!PLANNED_ITEM_KINDS.has(kind)) {
    return { ok: false, error: "Jenis tidak valid." };
  }

  if (!PLANNED_REPEAT_INTERVALS.has(repeat)) {
    return { ok: false, error: "Pengulangan tidak valid." };
  }

  if (!startAt) {
    return { ok: false, error: "Tanggal mulai tidak valid." };
  }

  if (!amount) {
    return { ok: false, error: "Nominal tidak valid." };
  }

  if (!PLANNED_END_MODES.has(endMode)) {
    return { ok: false, error: "Mode akhir tidak valid." };
  }

  const input: PlannedItemFormInput = {
    name,
    kind,
    repeat,
    amount,
    startAt,
    endMode,
    note: note || undefined,
  };

  if (kind === "installment") {
    const installmentTotal = parseAmount(
      readString(formData, "installmentTotal"),
    );

    if (!installmentTotal) {
      return { ok: false, error: "Total cicilan wajib diisi." };
    }

    const startDate = parseDateOnlyInput(startAt);
    if (!startDate) {
      return { ok: false, error: "Tanggal mulai tidak valid." };
    }

    const schedule = computeInstallmentScheduleFromAmounts(
      startDate,
      repeat,
      installmentTotal,
      amount,
    );

    if (!schedule) {
      return {
        ok: false,
        error:
          "Nominal cicilan tidak valid. Pastikan total dan bayar per bulan terisi.",
      };
    }

    input.endMode = "installments";
    input.installmentCount = schedule.installmentCount;

    const isNewInstallment = readString(formData, "installmentIsNew") !== "off";
    if (isNewInstallment) {
      input.paidInstallmentCount = 0;
    } else {
      const paidPrior = parseNonNegativeInteger(
        readString(formData, "paidInstallmentCount"),
      );

      if (paidPrior === null) {
        return {
          ok: false,
          error: "Jumlah cicilan yang sudah dibayar tidak valid.",
        };
      }

      if (paidPrior >= schedule.installmentCount) {
        return {
          ok: false,
          error: "Sudah dibayar harus kurang dari total jumlah cicilan.",
        };
      }

      input.paidInstallmentCount = paidPrior;
    }

    const endAtManual = parseDateInput(readString(formData, "endAt"));
    if (endAtManual) {
      if (endAtManual < startAt) {
        return {
          ok: false,
          error: "Tanggal selesai harus setelah tanggal mulai.",
        };
      }

      input.endAt = endAtManual;
    } else {
      input.endAt = toDateInputValue(schedule.endAt);
    }

    return { ok: true, data: input };
  }

  if (endMode === "installments") {
    const installmentCount = parsePositiveInteger(
      readString(formData, "installmentCount"),
    );

    if (!installmentCount) {
      return { ok: false, error: "Jumlah cicilan harus lebih dari 0." };
    }

    input.installmentCount = installmentCount;
  }

  if (endMode === "date") {
    const endAt = parseDateInput(readString(formData, "endAt"));

    if (!endAt) {
      return { ok: false, error: "Tanggal akhir tidak valid." };
    }

    if (endAt < startAt) {
      return { ok: false, error: "Tanggal akhir harus setelah tanggal mulai." };
    }

    input.endAt = endAt;
  }

  return { ok: true, data: input };
}

export function getPlannedItemEndMode(
  item: Pick<PlannedItemRecord, "installmentCount" | "endAt">,
): PlannedEndMode {
  if (item.installmentCount) {
    return "installments";
  }

  if (item.endAt) {
    return "date";
  }

  return "never";
}

export function toDateInputValue(value: Date | string): string {
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value;
  }

  const date = value instanceof Date ? value : new Date(value);
  return toDayKey(date);
}

export { todayDateInputValue };
