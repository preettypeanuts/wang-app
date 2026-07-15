"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  createUserCategoryAction,
  deleteUserCategoryAction,
  fetchUserCategoryCatalogAction,
  resetUserCategoryAction,
  updateUserCategoryAction,
} from "@/app/actions/user-categories";
import {
  buildCategoryMentionOptionsFromCatalog,
  getCategoryLabelFromCatalog,
  getExpenseCategoriesFromCatalog,
  isCategoryInCatalog,
  mergeUserCategoryCatalog,
} from "@/lib/finance/user-category-catalog";
import { useSession } from "@/lib/auth/auth-client";
import type { CategoryMentionOption } from "@/config/category-mentions";
import type { ResolvedCategory } from "@/types/user-category";
import type { TransactionType } from "@/types/transaction";

interface UserCategoryCatalogContextValue {
  catalog: ResolvedCategory[];
  loading: boolean;
  refreshCatalog: () => Promise<void>;
  getLabel: (categoryId: string) => string;
  getEntry: (categoryId: string) => ResolvedCategory | undefined;
  getMentionOptions: (type: TransactionType) => CategoryMentionOption[];
  getExpenseOptions: () => ResolvedCategory[];
  isValidCategory: (categoryId: string, type?: TransactionType) => boolean;
  createCategory: (formData: FormData) => Promise<{ ok: true } | { ok: false; error: string }>;
  updateCategory: (formData: FormData) => Promise<{ ok: true } | { ok: false; error: string }>;
  deleteCategory: (id: string) => Promise<{ ok: true } | { ok: false; error: string }>;
  resetCategory: (slug: string) => Promise<{ ok: true } | { ok: false; error: string }>;
}

const UserCategoryCatalogContext =
  createContext<UserCategoryCatalogContextValue | null>(null);

interface UserCategoryCatalogProviderProps {
  children: React.ReactNode;
}

export function UserCategoryCatalogProvider({
  children,
}: UserCategoryCatalogProviderProps) {
  const { data: session } = useSession();
  const userId = session?.user?.id ?? null;
  const [catalog, setCatalog] = useState<ResolvedCategory[]>(() =>
    mergeUserCategoryCatalog([]),
  );
  const [loading, setLoading] = useState(Boolean(userId));

  const refreshCatalog = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const nextCatalog = await fetchUserCategoryCatalogAction();
      setCatalog(nextCatalog);
    } catch {
      setCatalog(mergeUserCategoryCatalog([]));
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    void refreshCatalog();
  }, [refreshCatalog]);

  const value = useMemo<UserCategoryCatalogContextValue>(() => {
    return {
      catalog,
      loading,
      refreshCatalog,
      getLabel: (categoryId) => getCategoryLabelFromCatalog(catalog, categoryId),
      getEntry: (categoryId) => catalog.find((entry) => entry.id === categoryId),
      getMentionOptions: (type) =>
        buildCategoryMentionOptionsFromCatalog(catalog, type),
      getExpenseOptions: () => getExpenseCategoriesFromCatalog(catalog),
      isValidCategory: (categoryId, type) =>
        isCategoryInCatalog(catalog, categoryId, type),
      createCategory: async (formData) => {
        const result = await createUserCategoryAction(formData);
        if (!result.ok) {
          return result;
        }
        setCatalog(result.catalog);
        return { ok: true };
      },
      updateCategory: async (formData) => {
        const result = await updateUserCategoryAction(formData);
        if (!result.ok) {
          return result;
        }
        setCatalog(result.catalog);
        return { ok: true };
      },
      deleteCategory: async (id) => {
        const result = await deleteUserCategoryAction(id);
        if (!result.ok) {
          return result;
        }
        setCatalog(result.catalog);
        return { ok: true };
      },
      resetCategory: async (slug) => {
        const result = await resetUserCategoryAction(slug);
        if (!result.ok) {
          return result;
        }
        setCatalog(result.catalog);
        return { ok: true };
      },
    };
  }, [catalog, loading, refreshCatalog]);

  return (
    <UserCategoryCatalogContext.Provider value={value}>
      {children}
    </UserCategoryCatalogContext.Provider>
  );
}

export function useUserCategoryCatalog(): UserCategoryCatalogContextValue {
  const context = useContext(UserCategoryCatalogContext);
  if (!context) {
    throw new Error(
      "useUserCategoryCatalog must be used within UserCategoryCatalogProvider",
    );
  }
  return context;
}

export function useOptionalUserCategoryCatalog():
  | UserCategoryCatalogContextValue
  | null {
  return useContext(UserCategoryCatalogContext);
}
