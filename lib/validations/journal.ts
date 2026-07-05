import { JOURNAL_PAGE_SIZE } from "@/config/journal";
import { isTransactionCategory } from "@/config/categories";
import type { JournalFilters } from "@/types/journal";
import type { TransactionType } from "@/types/transaction";

const VALID_TYPES = new Set<TransactionType>(["income", "expense"]);

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

export function parseJournalSearchParams(
  searchParams: Record<string, string | string[] | undefined>,
): JournalFilters {
  const q = readParam(searchParams, "q");
  const typeRaw = readParam(searchParams, "type");
  const categoryRaw = readParam(searchParams, "category");
  const pageRaw = Number.parseInt(readParam(searchParams, "page") || "1", 10);

  const type =
    typeRaw && VALID_TYPES.has(typeRaw as TransactionType)
      ? (typeRaw as TransactionType)
      : "all";

  const category =
    categoryRaw && isTransactionCategory(categoryRaw) ? categoryRaw : "all";

  const page =
    Number.isFinite(pageRaw) && pageRaw > 0 ? pageRaw : 1;

  return { q, type, category, page };
}

export function buildJournalSearchParams(
  filters: JournalFilters,
  page = filters.page,
): URLSearchParams {
  const params = new URLSearchParams();

  if (filters.q) {
    params.set("q", filters.q);
  }

  if (filters.type !== "all") {
    params.set("type", filters.type);
  }

  if (filters.category !== "all") {
    params.set("category", filters.category);
  }

  if (page > 1) {
    params.set("page", String(page));
  }

  return params;
}

export function getJournalPageSize(): number {
  return JOURNAL_PAGE_SIZE;
}
