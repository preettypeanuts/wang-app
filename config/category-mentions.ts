import {
  TRANSACTION_CATEGORIES,
  type TransactionCategoryId,
} from "@/config/categories";

/** Canonical @mention token per category (without @). */
export const CATEGORY_MENTION_TOKENS: Record<TransactionCategoryId, string> = {
  food: "makanan",
  groceries: "sembako",
  transport: "transport",
  shopping: "belanja",
  housing: "rumah",
  utilities: "tagihan",
  subscription: "langganan",
  entertainment: "hiburan",
  health: "kesehatan",
  education: "pendidikan",
  personal: "personal",
  family: "keluarga",
  travel: "travel",
  pets: "hewan",
  gifts: "hadiah",
  business: "bisnis",
  insurance: "asuransi",
  fees: "biaya",
  investment: "investasi",
  salary: "gaji",
  side_income: "pemasukan",
  other: "lainnya",
};

export interface CategoryMentionOption {
  id: string;
  label: string;
  token: string;
  searchTerms: string[];
}

function normalizeSearchTerm(value: string): string {
  return value.trim().toLowerCase();
}

export function buildCategoryMentionOptions(): CategoryMentionOption[] {
  return TRANSACTION_CATEGORIES.map((category) => {
    const id = category.id as TransactionCategoryId;
    const token = CATEGORY_MENTION_TOKENS[id];
    const searchTerms = new Set<string>([
      token,
      id,
      ...category.keywords.map(normalizeSearchTerm),
      ...category.label
        .split(/[&/,]/)
        .map((part) => normalizeSearchTerm(part))
        .filter(Boolean),
    ]);

    return {
      id,
      label: category.label,
      token,
      searchTerms: [...searchTerms],
    };
  });
}

export const CATEGORY_MENTION_OPTIONS = buildCategoryMentionOptions();
