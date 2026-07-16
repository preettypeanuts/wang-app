import type { WalletType as PrismaWalletType } from "@/generated/prisma/client";

export type WalletType = PrismaWalletType;

export interface WalletRecord {
  id: string;
  name: string;
  type: WalletType;
  icon: string | null;
  colorHex: string | null;
  initialBalance: number;
  isDefault: boolean;
  isArchived: boolean;
  adminFeeAmount: number | null;
  adminFeeDay: number | null;
  createdAt: string;
}

export interface WalletAdminFeeInput {
  enabled: boolean;
  amount: number;
  day: number;
}

export interface WalletFormInput {
  name: string;
  type: WalletType;
  initialBalance: number;
  icon?: string | null;
  adminFee?: WalletAdminFeeInput | null;
}

export interface WalletWithBalance extends WalletRecord {
  balance: number;
  /** Latest transaction date for this wallet; falls back to createdAt in UI. */
  lastActivityAt: string | null;
}

export interface WalletTransferPickerOption {
  id: string;
  name: string;
  type: WalletType;
  icon: string | null;
}
