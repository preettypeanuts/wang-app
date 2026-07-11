import {
  CATEGORY_MENTION_TOKENS,
  type CategoryMentionOption,
} from "@/config/category-mentions";
import {
  isCategoryIconId,
  resolveCategoryIconId,
} from "@/config/category-icons";
import {
  isIncomeCategory,
  TRANSACTION_CATEGORIES,
  type TransactionCategoryId,
} from "@/config/categories";
import { getCategoryTileStyle } from "@/config/summary-tiles";
import {
  getCategoryIconAccent,
  resolveCategoryAccent,
} from "@/config/category-icon-style";
import type { ResolvedCategory, UserCategoryRecord } from "@/types/user-category";
import type { TransactionType } from "@/types/transaction";

function normalizeSearchTerm(value: string): string {
  return value.trim().toLowerCase();
}

function slugifyMentionToken(label: string): string {
  const slug = label
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "")
    .slice(0, 24);

  return slug || "kategori";
}

function resolveBuiltInToken(categoryId: string): string {
  if (categoryId in CATEGORY_MENTION_TOKENS) {
    return CATEGORY_MENTION_TOKENS[categoryId as TransactionCategoryId];
  }

  return categoryId.replace(/^custom_/, "c_");
}

function buildSearchTerms(
  id: string,
  label: string,
  token: string,
  keywords: readonly string[] = [],
): string[] {
  const terms = new Set<string>([
    token,
    id,
    normalizeSearchTerm(label),
    ...keywords.map(normalizeSearchTerm),
    ...label
      .split(/[&/,]/)
      .map((part) => normalizeSearchTerm(part))
      .filter(Boolean),
  ]);

  return [...terms];
}

function resolveBuiltInIcon(categoryId: string): ResolvedCategory["icon"] {
  return getCategoryTileStyle(categoryId).icon;
}

function mapBuiltInCategory(
  categoryId: TransactionCategoryId,
  override: UserCategoryRecord | undefined,
): ResolvedCategory | null {
  const definition = TRANSACTION_CATEGORIES.find(
    (category) => category.id === categoryId,
  );

  if (!definition) {
    return null;
  }

  if (override?.hidden) {
    return null;
  }

  const type: TransactionType = isIncomeCategory(categoryId)
    ? "income"
    : "expense";
  const label = override?.label ?? definition.label;
  const icon =
    override?.iconIsCustom && override.icon
      ? override.icon
      : resolveBuiltInIcon(categoryId);
  const accent = resolveCategoryAccent(categoryId, override);
  const token = resolveBuiltInToken(categoryId);

  return {
    id: categoryId,
    label,
    icon,
    accent,
    type,
    isCustom: false,
    token,
    searchTerms: buildSearchTerms(categoryId, label, token, definition.keywords),
    recordId: override?.id,
  };
}

function mapCustomCategory(record: UserCategoryRecord): ResolvedCategory {
  const token = slugifyMentionToken(record.label);

  return {
    id: record.slug,
    label: record.label,
    icon: record.icon,
    accent: resolveCategoryAccent(record.slug, record),
    type: record.type,
    isCustom: true,
    token,
    searchTerms: buildSearchTerms(record.slug, record.label, token),
    recordId: record.id,
  };
}

export function mergeUserCategoryCatalog(
  overrides: UserCategoryRecord[],
): ResolvedCategory[] {
  const overrideBySlug = new Map(
    overrides.map((record) => [record.slug, record]),
  );
  const builtInIds = new Set<string>(
    TRANSACTION_CATEGORIES.map((category) => category.id),
  );

  const builtIn = TRANSACTION_CATEGORIES.flatMap((category) => {
    const id = category.id as TransactionCategoryId;
    const override = overrideBySlug.get(id);
    const resolved = mapBuiltInCategory(id, override);
    return resolved ? [resolved] : [];
  });

  const custom = overrides
    .filter((record) => !record.baseCategoryId && !builtInIds.has(record.slug))
    .filter((record) => !record.hidden)
    .sort((left, right) => left.sortOrder - right.sortOrder)
    .map(mapCustomCategory);

  return [...builtIn, ...custom];
}

export function getCategoryLabelFromCatalog(
  catalog: ResolvedCategory[],
  categoryId: string,
): string {
  const match = catalog.find((entry) => entry.id === categoryId);
  if (match) {
    return match.label;
  }

  const builtIn = TRANSACTION_CATEGORIES.find(
    (category) => category.id === categoryId,
  );
  return builtIn?.label ?? "Lainnya";
}

export function isCategoryInCatalog(
  catalog: ResolvedCategory[],
  categoryId: string,
  type?: TransactionType,
): boolean {
  const match = catalog.find((entry) => entry.id === categoryId);
  if (!match) {
    return false;
  }

  if (type && match.type !== type) {
    return false;
  }

  return true;
}

export function resolveCategoryForTransaction(
  categoryId: string,
  transactionType: TransactionType,
  catalog: ResolvedCategory[],
): string {
  const match = catalog.find((entry) => entry.id === categoryId);
  if (match) {
    if (match.type === transactionType) {
      return match.id;
    }

    const fallback = catalog.find(
      (entry) => entry.type === transactionType && entry.id === "other",
    );
    return fallback?.id ?? "other";
  }

  const normalized = categoryId.trim().toLowerCase();
  const builtInMatch = catalog.find((entry) => entry.id === normalized);
  if (builtInMatch && builtInMatch.type === transactionType) {
    return builtInMatch.id;
  }

  return transactionType === "income" ? "side_income" : "other";
}

export function buildCategoryMentionOptionsFromCatalog(
  catalog: ResolvedCategory[],
  type: TransactionType,
): CategoryMentionOption[] {
  return catalog
    .filter((entry) => entry.type === type)
    .map((entry) => ({
      id: entry.id,
      label: entry.label,
      token: entry.token,
      searchTerms: entry.searchTerms,
    }));
}

export function getExpenseCategoriesFromCatalog(
  catalog: ResolvedCategory[],
): ResolvedCategory[] {
  return catalog.filter((entry) => entry.type === "expense");
}

export function parseCategoryIcon(value: string): ResolvedCategory["icon"] {
  return isCategoryIconId(value) ? value : resolveCategoryIconId(value);
}

export function isExpenseCategoryId(
  categoryId: string,
  catalog?: ResolvedCategory[],
): boolean {
  if (catalog) {
    const match = catalog.find((entry) => entry.id === categoryId);
    if (match) {
      return match.type === "expense";
    }
  }

  return !isIncomeCategory(categoryId as TransactionCategoryId);
}
