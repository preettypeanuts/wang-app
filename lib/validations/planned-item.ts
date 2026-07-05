import { parseAmount } from "@/lib/finance/parse-amount";
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

function parsePositiveInteger(value: string): number | null {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return null;
  }

  return parsed;
}

function parseDateInput(value: string): string | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return null;
  }

  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return value;
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

  if (kind === "installment" && endMode === "never") {
    return {
      ok: false,
      error: "Cicilan membutuhkan jumlah periode (mis. 12x).",
    };
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
  const date = value instanceof Date ? value : new Date(value);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
