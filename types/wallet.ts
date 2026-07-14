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
  createdAt: string;
}

export interface WalletFormInput {
  name: string;
  type: WalletType;
  initialBalance: number;
}

export interface WalletWithBalance extends WalletRecord {
  balance: number;
}
