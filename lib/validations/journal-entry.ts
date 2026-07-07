import {
  isTransactionCategory,
  normalizeCategory,
  resolveCategoryForType,
  getCategoryLabel,
} from "@/config/categories";
import { parseAmount } from "@/lib/finance/parse-amount";
import { isValidDateInput } from "@/lib/validations/planned-item";
import type { JournalEntryFormInput } from "@/types/journal";
import type { TransactionType } from "@/types/transaction";

const VALID_TYPES = new Set<TransactionType>(["income", "expense"]);

function readString(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function parseOccurredAtDateInput(
  dateInput: string,
  existing?: Date | string,
): Date | null {
  if (!isValidDateInput(dateInput)) {
    return null;
  }

  const [year, month, day] = dateInput.split("-").map(Number);

  if (existing) {
    const base = existing instanceof Date ? existing : new Date(existing);
    if (!Number.isNaN(base.getTime())) {
      return new Date(
        year,
        month - 1,
        day,
        base.getHours(),
        base.getMinutes(),
        base.getSeconds(),
        base.getMilliseconds(),
      );
    }
  }

  return new Date(year, month - 1, day, 12, 0, 0, 0);
}

export function parseJournalEntryFormData(
  formData: FormData,
  existingOccurredAt?: Date | string,
): { ok: true; data: JournalEntryFormInput } | { ok: false; error: string } {
  const typeRaw = readString(formData, "type");

  if (!VALID_TYPES.has(typeRaw as TransactionType)) {
    return { ok: false, error: "Jenis transaksi tidak valid." };
  }

  const type = typeRaw as TransactionType;
  const amountRaw = readString(formData, "amount");
  const amount =
    parseAmount(amountRaw) ??
    (Number.parseInt(amountRaw.replace(/\D/g, ""), 10) || null);

  if (amount === null || amount <= 0) {
    return { ok: false, error: "Nominal tidak valid." };
  }

  const descriptionInput = readString(formData, "description");

  const category = resolveCategoryForType(
    normalizeCategory(readString(formData, "category")),
    type,
  );

  if (!isTransactionCategory(category)) {
    return { ok: false, error: "Kategori tidak valid." };
  }

  const description = descriptionInput || getCategoryLabel(category);
  const rawInput = readString(formData, "rawInput") || description;
  const occurredAt = parseOccurredAtDateInput(
    readString(formData, "occurredAt"),
    existingOccurredAt,
  );

  if (!occurredAt) {
    return { ok: false, error: "Tanggal transaksi tidak valid." };
  }

  return {
    ok: true,
    data: {
      type,
      amount,
      category,
      description,
      rawInput,
      occurredAt,
    },
  };
}
