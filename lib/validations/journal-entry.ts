import {
  getCategoryLabel,
  isTransactionCategory,
  normalizeCategory,
  resolveCategoryForType,
} from "@/config/categories";
import {
  getCategoryLabelFromCatalog,
  isCategoryInCatalog,
  resolveCategoryForTransaction,
} from "@/lib/finance/user-category-catalog";
import { parseAmount } from "@/lib/finance/parse-amount";
import { parseDateOnlyInput } from "@/lib/finance/day-range";
import { isValidDateInput } from "@/lib/validations/planned-item";
import type { ResolvedCategory } from "@/types/user-category";
import type { JournalEntryFormInput } from "@/types/journal";
import type { TransactionType } from "@/types/transaction";

const VALID_TYPES = new Set<TransactionType>(["income", "expense"]);

function readString(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function parseOccurredAtDateInput(dateInput: string): Date | null {
  if (!isValidDateInput(dateInput)) {
    return null;
  }

  return parseDateOnlyInput(dateInput);
}

export function parseJournalEntryFormData(
  formData: FormData,
  catalog?: ResolvedCategory[],
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

  const categoryRaw = readString(formData, "category");
  const category = catalog
    ? resolveCategoryForTransaction(categoryRaw, type, catalog)
    : resolveCategoryForType(
        normalizeCategory(categoryRaw),
        type,
      );

  if (catalog) {
    if (!isCategoryInCatalog(catalog, category, type)) {
      return { ok: false, error: "Kategori tidak valid." };
    }
  } else if (!isTransactionCategory(category)) {
    return { ok: false, error: "Kategori tidak valid." };
  }

  const description =
    descriptionInput ||
    (catalog ? getCategoryLabelFromCatalog(catalog, category) : getCategoryLabel(category));
  const rawInput = readString(formData, "rawInput") || description;
  const occurredAt = parseOccurredAtDateInput(
    readString(formData, "occurredAt"),
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
