"use server";

import { revalidatePath, revalidateTag } from "next/cache";

import { isCategoryIconId } from "@/config/category-icons";
import { isCategoryAccent } from "@/config/category-colors";
import {
  isTransactionCategory,
} from "@/config/categories";
import { requireUserId } from "@/lib/auth/session";
import { userDataTags } from "@/lib/cache/user-data-tags";
import {
  createUserCategory,
  deleteUserCategoryById,
  resetUserCategoryOverride,
  updateUserCategoryById,
  upsertUserCategoryOverride,
} from "@/lib/db/user-categories";
import {
  getCachedUserCategoryCatalog,
  resolveUserCategoryCatalog,
} from "@/lib/finance/resolve-user-categories";
import type {
  ResolvedCategory,
  UserCategoryFormInput,
} from "@/types/user-category";

interface ActionFailure {
  ok: false;
  error: string;
}

function revalidateCategoryPaths(userId: string) {
  revalidatePath("/", "layout");
  revalidatePath("/journal");
  revalidatePath("/payplan");
  revalidatePath("/overview");
  revalidateTag(userDataTags.categories(userId), { expire: 0 });
}

function readString(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function parseCategoryFormInput(
  formData: FormData,
): { ok: true; data: UserCategoryFormInput } | ActionFailure {
  const label = readString(formData, "label");
  const icon = readString(formData, "icon");
  const accentLight = readString(formData, "accentLight");
  const accentDark = readString(formData, "accentDark");
  const typeRaw = readString(formData, "type");

  if (label.length < 2) {
    return { ok: false, error: "Category name must be at least 2 characters." };
  }

  if (label.length > 48) {
    return { ok: false, error: "Category name is too long." };
  }

  if (!isCategoryIconId(icon)) {
    return { ok: false, error: "Invalid icon." };
  }

  if (!isCategoryAccent({ light: accentLight, dark: accentDark })) {
    return { ok: false, error: "Invalid color." };
  }

  if (typeRaw !== "income" && typeRaw !== "expense") {
    return { ok: false, error: "Invalid category type." };
  }

  return {
    ok: true,
    data: {
      label,
      icon,
      accent: {
        light: accentLight,
        dark: accentDark,
      },
      type: typeRaw,
    },
  };
}

export async function fetchUserCategoryCatalogAction(): Promise<
  ResolvedCategory[]
> {
  const userId = await requireUserId();
  return getCachedUserCategoryCatalog(userId);
}

export async function createUserCategoryAction(
  formData: FormData,
): Promise<{ ok: true; catalog: ResolvedCategory[] } | ActionFailure> {
  const userId = await requireUserId();
  const parsed = parseCategoryFormInput(formData);

  if (!parsed.ok) {
    return parsed;
  }

  await createUserCategory(userId, parsed.data);
  revalidateCategoryPaths(userId);

  return {
    ok: true,
    catalog: await resolveUserCategoryCatalog(userId),
  };
}

export async function updateUserCategoryAction(
  formData: FormData,
): Promise<{ ok: true; catalog: ResolvedCategory[] } | ActionFailure> {
  const userId = await requireUserId();
  const parsed = parseCategoryFormInput(formData);
  const id = readString(formData, "id");
  const mode = readString(formData, "mode");

  if (!parsed.ok) {
    return parsed;
  }

  if (mode === "override") {
    const slug = readString(formData, "slug");
    if (!isTransactionCategory(slug)) {
      return { ok: false, error: "Invalid default category." };
    }

    await upsertUserCategoryOverride(userId, {
      slug,
      label: parsed.data.label,
      icon: parsed.data.icon,
      accent: parsed.data.accent,
    });
    revalidateCategoryPaths(userId);

    return {
      ok: true,
      catalog: await resolveUserCategoryCatalog(userId),
    };
  }

  if (!id) {
    return { ok: false, error: "Category not found." };
  }

  const updated = await updateUserCategoryById(userId, id, parsed.data);
  if (!updated) {
    return { ok: false, error: "Category not found." };
  }

  revalidateCategoryPaths(userId);

  return {
    ok: true,
    catalog: await resolveUserCategoryCatalog(userId),
  };
}

export async function deleteUserCategoryAction(
  id: string,
): Promise<{ ok: true; catalog: ResolvedCategory[] } | ActionFailure> {
  const userId = await requireUserId();
  const deleted = await deleteUserCategoryById(userId, id);

  if (!deleted) {
    return { ok: false, error: "Only custom categories can be deleted." };
  }

  revalidateCategoryPaths(userId);

  return {
    ok: true,
    catalog: await resolveUserCategoryCatalog(userId),
  };
}

export async function resetUserCategoryAction(
  slug: string,
): Promise<{ ok: true; catalog: ResolvedCategory[] } | ActionFailure> {
  const userId = await requireUserId();

  if (!isTransactionCategory(slug)) {
    return { ok: false, error: "Invalid default category." };
  }

  await resetUserCategoryOverride(userId, slug);
  revalidateCategoryPaths(userId);

  return {
    ok: true,
    catalog: await resolveUserCategoryCatalog(userId),
  };
}
