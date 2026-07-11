import {
  isIncomeCategory,
  normalizeCategory,
  TRANSACTION_CATEGORIES,
} from "@/config/categories";
import {
  isExpenseCategoryId,
  resolveCategoryForTransaction,
} from "@/lib/finance/user-category-catalog";
import type { ResolvedCategory } from "@/types/user-category";
import { parseAmount } from "@/lib/finance/parse-amount";
import { parseMonthKey } from "@/lib/planner/calendar";
import type { BudgetLimitMode, CategoryBudgetFormInput } from "@/types/budget";

const BUDGET_LIMIT_MODES = new Set<BudgetLimitMode>(["daily", "fixed"]);

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

function isExpenseCategory(
  category: string,
  catalog?: ResolvedCategory[],
): boolean {
  if (catalog) {
    return isExpenseCategoryId(category, catalog);
  }

  const normalized = normalizeCategory(category);
  return !isIncomeCategory(normalized as never);
}

export function parseCategoryBudgetFormData(
  formData: FormData,
  catalog?: ResolvedCategory[],
): { ok: true; data: CategoryBudgetFormInput } | { ok: false; error: string } {
  const categoryRaw = readString(formData, "category");
  const category = catalog
    ? resolveCategoryForTransaction(categoryRaw, "expense", catalog)
    : normalizeCategory(categoryRaw);
  const periodMonth = readString(formData, "periodMonth");
  const limitMode = readString(formData, "limitMode") as BudgetLimitMode;
  const dailyAmountText = readString(formData, "dailyAmount");
  const fixedLimitText = readString(formData, "fixedLimit");
  const dayCountText = readString(formData, "dayCount");
  const note = readString(formData, "note");
  const repeatNextMonth = readString(formData, "repeatNextMonth") === "true";

  if (!isExpenseCategory(category, catalog)) {
    return { ok: false, error: "Kategori budget tidak valid." };
  }

  if (!parseMonthKey(periodMonth)) {
    return { ok: false, error: "Periode bulan tidak valid." };
  }

  if (!BUDGET_LIMIT_MODES.has(limitMode)) {
    return { ok: false, error: "Mode budget tidak valid." };
  }

  if (limitMode === "daily") {
    const dailyAmount = parseAmount(dailyAmountText);
    if (dailyAmount === null || dailyAmount <= 0) {
      return { ok: false, error: "Nominal per hari wajib diisi." };
    }

    const dayCount = dayCountText
      ? parsePositiveInteger(dayCountText)
      : undefined;
    if (dayCountText && !dayCount) {
      return { ok: false, error: "Jumlah hari tidak valid." };
    }

    return {
      ok: true,
      data: {
        category,
        periodMonth,
        limitMode,
        dailyAmount,
        dayCount: dayCount ?? undefined,
        note: note || undefined,
        repeatNextMonth,
      },
    };
  }

  const fixedLimit = parseAmount(fixedLimitText);
  if (fixedLimit === null || fixedLimit <= 0) {
    return { ok: false, error: "Total budget wajib diisi." };
  }

  return {
    ok: true,
    data: {
      category,
      periodMonth,
      limitMode,
      fixedLimit,
      note: note || undefined,
      repeatNextMonth,
    },
  };
}

export function getBudgetCategoryOptions(catalog?: ResolvedCategory[]) {
  if (catalog) {
    return catalog
      .filter((entry) => entry.type === "expense")
      .map((entry) => ({
        id: entry.id,
        label: entry.label,
      }));
  }

  return TRANSACTION_CATEGORIES.filter(
    (category) => !isIncomeCategory(category.id as never),
  ).map((category) => ({
    id: category.id,
    label: category.label,
  }));
}
