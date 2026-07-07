import { JOURNAL_PAGE_SIZE } from "@/config/journal";
import { isTransactionCategory } from "@/config/categories";
import {
  getDefaultJournalDateRange,
  normalizeJournalDateRange,
} from "@/lib/finance/journal-period";
import type { JournalFilters } from "@/types/journal";
import type { TransactionType } from "@/types/transaction";

const VALID_TYPES = new Set<TransactionType>(["income", "expense"]);
const DATE_ONLY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function readParam(
  searchParams: Record<string, string | string[] | undefined>,
  key: string,
): string {
  const value = searchParams[key];
  if (Array.isArray(value)) {
    return value[0]?.trim() ?? "";
  }

  return value?.trim() ?? "";
}

function readDateParam(
  searchParams: Record<string, string | string[] | undefined>,
  key: string,
): string {
  const value = readParam(searchParams, key);
  return DATE_ONLY_PATTERN.test(value) ? value : "";
}

export function parseJournalSearchParams(
  searchParams: Record<string, string | string[] | undefined>,
): JournalFilters {
  const q = readParam(searchParams, "q");
  const typeRaw = readParam(searchParams, "type");
  const categoryRaw = readParam(searchParams, "category");
  const pageRaw = Number.parseInt(readParam(searchParams, "page") || "1", 10);
  const fromRaw = readDateParam(searchParams, "from");
  const toRaw = readDateParam(searchParams, "to");

  const type =
    typeRaw && VALID_TYPES.has(typeRaw as TransactionType)
      ? (typeRaw as TransactionType)
      : "all";

  const category =
    categoryRaw && isTransactionCategory(categoryRaw) ? categoryRaw : "all";

  const page =
    Number.isFinite(pageRaw) && pageRaw > 0 ? pageRaw : 1;

  const defaults = getDefaultJournalDateRange();
  const range = normalizeJournalDateRange(
    fromRaw || defaults.from,
    toRaw || defaults.to,
  );

  return {
    q,
    type,
    category,
    page,
    from: range.from,
    to: range.to,
  };
}

export function buildJournalSearchParams(
  filters: JournalFilters,
  page = filters.page,
): URLSearchParams {
  const params = new URLSearchParams();
  const defaults = getDefaultJournalDateRange();

  if (filters.q) {
    params.set("q", filters.q);
  }

  if (filters.type !== "all") {
    params.set("type", filters.type);
  }

  if (filters.category !== "all") {
    params.set("category", filters.category);
  }

  if (filters.from !== defaults.from || filters.to !== defaults.to) {
    params.set("from", filters.from);
    params.set("to", filters.to);
  }

  if (page > 1) {
    params.set("page", String(page));
  }

  return params;
}

export function getJournalPageSize(): number {
  return JOURNAL_PAGE_SIZE;
}
