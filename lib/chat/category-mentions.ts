import {
  isIncomeCategory,
  normalizeCategory,
  resolveCategoryForType,
  type TransactionCategoryId,
} from "@/config/categories";
import {
  CATEGORY_MENTION_OPTIONS,
  type CategoryMentionOption,
} from "@/config/category-mentions";
import type { TransactionType } from "@/types/transaction";

export interface CategoryMentionRange {
  query: string;
  start: number;
  end: number;
}

export interface ExplicitCategoryExtraction {
  category: TransactionCategoryId | null;
  cleanedText: string;
}

const MENTION_PATTERN = /@([a-zA-Z0-9_]+)/g;

function normalizeQuery(value: string): string {
  return value.trim().toLowerCase();
}

export function detectCategoryMentionRange(
  text: string,
  cursor: number,
): CategoryMentionRange | null {
  const safeCursor = Math.max(0, Math.min(cursor, text.length));
  const beforeCursor = text.slice(0, safeCursor);
  const atIndex = beforeCursor.lastIndexOf("@");

  if (atIndex === -1) {
    return null;
  }

  if (atIndex > 0 && !/\s/.test(beforeCursor[atIndex - 1] ?? "")) {
    return null;
  }

  const query = beforeCursor.slice(atIndex + 1);

  if (query.includes(" ")) {
    return null;
  }

  return {
    query,
    start: atIndex,
    end: safeCursor,
  };
}

function matchesCategoryMentionQuery(
  option: CategoryMentionOption,
  normalized: string,
): boolean {
  if (option.token.startsWith(normalized) || option.id.startsWith(normalized)) {
    return true;
  }

  if (option.label.toLowerCase().includes(normalized)) {
    return true;
  }

  return option.searchTerms.some((term) => term.includes(normalized));
}

export function getCategoryMentionOptionsForType(
  type: TransactionType,
): CategoryMentionOption[] {
  return CATEGORY_MENTION_OPTIONS.filter((option) =>
    type === "income"
      ? isIncomeCategory(option.id)
      : !isIncomeCategory(option.id),
  );
}

export function filterCategoryMentionOptions(
  query: string,
  options: CategoryMentionOption[] = CATEGORY_MENTION_OPTIONS,
): CategoryMentionOption[] {
  const normalized = normalizeQuery(query);

  if (!normalized) {
    return options;
  }

  return options.filter((option) =>
    matchesCategoryMentionQuery(option, normalized),
  );
}

export function filterCategoryMentionOptionsForType(
  query: string,
  type: TransactionType,
): CategoryMentionOption[] {
  return filterCategoryMentionOptions(
    query,
    getCategoryMentionOptionsForType(type),
  );
}

export function insertCategoryMention(
  text: string,
  range: Pick<CategoryMentionRange, "start" | "end">,
  token: string,
): { nextText: string; nextCursor: number } {
  const mention = `@${token}`;
  const before = text.slice(0, range.start);
  const after = text.slice(range.end);
  const nextText = `${before}${mention} ${after}`;
  const nextCursor = range.start + mention.length + 1;

  return { nextText, nextCursor };
}

function resolveMentionToken(token: string): TransactionCategoryId | null {
  const normalized = normalizeQuery(token);

  if (!normalized) {
    return null;
  }

  for (const option of CATEGORY_MENTION_OPTIONS) {
    if (option.token === normalized || option.id === normalized) {
      return option.id;
    }

    if (option.searchTerms.includes(normalized)) {
      return option.id;
    }
  }

  const prefixMatches = CATEGORY_MENTION_OPTIONS.filter(
    (option) =>
      option.token.startsWith(normalized) || option.id.startsWith(normalized),
  );

  if (prefixMatches.length === 1) {
    return prefixMatches[0]?.id ?? null;
  }

  return null;
}

export function extractExplicitCategoryFromText(
  text: string,
): ExplicitCategoryExtraction {
  const trimmed = text.trim();
  let category: TransactionCategoryId | null = null;
  let cleanedText = trimmed;

  for (const match of trimmed.matchAll(MENTION_PATTERN)) {
    const token = match[1];
    const resolved = resolveMentionToken(token);

    if (!resolved) {
      continue;
    }

    category = resolved;
    cleanedText = cleanedText.replace(match[0], " ");
  }

  cleanedText = cleanedText.replace(/\s+/g, " ").trim();

  return {
    category,
    cleanedText: cleanedText || trimmed.replace(MENTION_PATTERN, " ").trim(),
  };
}

export function resolveExplicitCategoryForType(
  text: string,
  type: TransactionType,
): {
  category: TransactionCategoryId | null;
  cleanedText: string;
} {
  const { category, cleanedText } = extractExplicitCategoryFromText(text);

  if (!category) {
    return { category: null, cleanedText };
  }

  return {
    category: resolveCategoryForType(normalizeCategory(category), type),
    cleanedText,
  };
}
