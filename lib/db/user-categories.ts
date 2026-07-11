import { resolveCategoryIconId } from "@/config/category-icons";
import { getCategoryIconAccent } from "@/config/category-icon-style";
import { accentsEqual } from "@/config/category-colors";
import { isIncomeCategory, type TransactionCategoryId } from "@/config/categories";
import { getCategoryTileStyle } from "@/config/summary-tiles";
import { prisma } from "@/lib/db/prisma";
import type {
  UserCategoryFormInput,
  UserCategoryOverrideInput,
  UserCategoryRecord,
} from "@/types/user-category";
import type { TransactionType } from "@/types/transaction";

function mapUserCategory(record: {
  id: string;
  userId: string;
  slug: string;
  label: string;
  icon: string;
  iconIsCustom: boolean;
  accentLight: string | null;
  accentDark: string | null;
  colorIsCustom: boolean;
  type: TransactionType;
  baseCategoryId: string | null;
  hidden: boolean;
  sortOrder: number;
}): UserCategoryRecord {
  return {
    id: record.id,
    userId: record.userId,
    slug: record.slug,
    label: record.label,
    icon: resolveCategoryIconId(record.icon),
    iconIsCustom: record.iconIsCustom,
    accentLight: record.accentLight,
    accentDark: record.accentDark,
    colorIsCustom: record.colorIsCustom,
    type: record.type,
    baseCategoryId: record.baseCategoryId,
    hidden: record.hidden,
    sortOrder: record.sortOrder,
  };
}

function resolveColorIsCustom(
  slug: string,
  accent: UserCategoryFormInput["accent"],
  isBuiltin: boolean,
): boolean {
  if (!isBuiltin) {
    return true;
  }

  return !accentsEqual(accent, getCategoryIconAccent(slug));
}

export async function listUserCategoriesForUser(
  userId: string,
): Promise<UserCategoryRecord[]> {
  const rows = await prisma.userCategory.findMany({
    where: { userId },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  });

  return rows.map(mapUserCategory);
}

export async function createUserCategory(
  userId: string,
  input: UserCategoryFormInput,
): Promise<UserCategoryRecord> {
  const slug = `custom_${crypto.randomUUID().replace(/-/g, "").slice(0, 12)}`;
  const sortOrder = await prisma.userCategory.count({
    where: { userId, baseCategoryId: null },
  });

  const created = await prisma.userCategory.create({
    data: {
      userId,
      slug,
      label: input.label.trim(),
      icon: input.icon,
      iconIsCustom: true,
      accentLight: input.accent.light,
      accentDark: input.accent.dark,
      colorIsCustom: true,
      type: input.type,
      sortOrder,
    },
  });

  return mapUserCategory(created);
}

export async function upsertUserCategoryOverride(
  userId: string,
  input: UserCategoryOverrideInput,
): Promise<UserCategoryRecord> {
  const slug = input.slug.trim();
  const type = isIncomeCategory(slug as TransactionCategoryId)
    ? "income"
    : "expense";
  const defaultIcon = resolveCategoryIconId(getCategoryTileStyle(slug).icon);
  const iconIsCustom = input.icon !== defaultIcon;
  const colorIsCustom = resolveColorIsCustom(slug, input.accent, true);
  const created = await prisma.userCategory.upsert({
    where: {
      userId_slug: {
        userId,
        slug,
      },
    },
    create: {
      userId,
      slug,
      label: input.label.trim(),
      icon: input.icon,
      iconIsCustom,
      accentLight: input.accent.light,
      accentDark: input.accent.dark,
      colorIsCustom,
      type,
      baseCategoryId: slug,
      hidden: input.hidden ?? false,
    },
    update: {
      label: input.label.trim(),
      icon: input.icon,
      iconIsCustom,
      accentLight: input.accent.light,
      accentDark: input.accent.dark,
      colorIsCustom,
      hidden: input.hidden ?? false,
    },
  });

  return mapUserCategory(created);
}

export async function updateUserCategoryById(
  userId: string,
  id: string,
  input: UserCategoryFormInput,
): Promise<UserCategoryRecord | null> {
  const existing = await prisma.userCategory.findFirst({
    where: { id, userId },
  });

  if (!existing) {
    return null;
  }

  const iconIsCustom = existing.baseCategoryId
    ? input.icon !==
      resolveCategoryIconId(getCategoryTileStyle(existing.slug).icon)
    : true;
  const colorIsCustom = existing.baseCategoryId
    ? resolveColorIsCustom(existing.slug, input.accent, true)
    : true;

  const updated = await prisma.userCategory.update({
    where: { id: existing.id },
    data: {
      label: input.label.trim(),
      icon: input.icon,
      iconIsCustom,
      accentLight: input.accent.light,
      accentDark: input.accent.dark,
      colorIsCustom,
      ...(existing.baseCategoryId
        ? {}
        : {
            type: input.type,
          }),
    },
  });

  return mapUserCategory(updated);
}

export async function deleteUserCategoryById(
  userId: string,
  id: string,
): Promise<boolean> {
  const existing = await prisma.userCategory.findFirst({
    where: { id, userId },
  });

  if (!existing || existing.baseCategoryId) {
    return false;
  }

  await prisma.userCategory.delete({
    where: { id: existing.id },
  });

  return true;
}

export async function resetUserCategoryOverride(
  userId: string,
  slug: string,
): Promise<boolean> {
  const existing = await prisma.userCategory.findFirst({
    where: {
      userId,
      slug,
      baseCategoryId: slug,
    },
  });

  if (!existing) {
    return false;
  }

  await prisma.userCategory.delete({
    where: { id: existing.id },
  });

  return true;
}
