import type { CategoryIconId } from "@/config/category-icons";
import type { CategoryIconAccent } from "@/config/category-icon-style";
import type { TransactionType } from "@/types/transaction";

export interface UserCategoryRecord {
  id: string;
  userId: string;
  slug: string;
  label: string;
  icon: CategoryIconId;
  iconIsCustom: boolean;
  accentLight: string | null;
  accentDark: string | null;
  colorIsCustom: boolean;
  type: TransactionType;
  baseCategoryId: string | null;
  hidden: boolean;
  sortOrder: number;
}

export interface ResolvedCategory {
  id: string;
  label: string;
  icon: CategoryIconId;
  accent: CategoryIconAccent;
  type: TransactionType;
  isCustom: boolean;
  token: string;
  searchTerms: string[];
  recordId?: string;
}

export interface UserCategoryFormInput {
  label: string;
  icon: CategoryIconId;
  accent: CategoryIconAccent;
  type: TransactionType;
}

export interface UserCategoryOverrideInput {
  slug: string;
  label: string;
  icon: CategoryIconId;
  accent: CategoryIconAccent;
  hidden?: boolean;
}
