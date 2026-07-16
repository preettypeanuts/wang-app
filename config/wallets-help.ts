import type { Icon } from "@/lib/icons";
import {
  CreditCardIcon,
  DotsThreeIcon,
  DotsThreeVerticalIcon,
  EyeSlashIcon,
  PlusIcon,
  WalletIcon,
} from "@/lib/icons";

export type WalletsHelpIconKey =
  | "tap"
  | "reorder"
  | "pager"
  | "add"
  | "eye"
  | "wallet";

export const WALLETS_HELP_ICON_MAP: Record<WalletsHelpIconKey, Icon> = {
  tap: CreditCardIcon,
  reorder: DotsThreeVerticalIcon,
  pager: DotsThreeIcon,
  add: PlusIcon,
  eye: EyeSlashIcon,
  wallet: WalletIcon,
};

export const WALLETS_HELP_TIP_LABEL = "Need help?";

export const WALLETS_HELP_TIP_CLUSTER = [
  "flex justify-center pt-2 pb-[calc(var(--mobile-bottom-nav-offset)+0.25rem)]",
  "md:pb-6",
].join(" ");

export const WALLETS_HELP_TIP_VISIBLE = "opacity-100";
export const WALLETS_HELP_TIP_HIDDEN =
  "pointer-events-none opacity-0 translate-y-1";

export const WALLETS_HELP_DRAWER_TITLE = "Cara pakai Wallets";

export const WALLETS_HELP_DRAWER_DESC =
  "Ringkas — fitur utama di halaman ini.";

export const WALLETS_HELP_ITEM_ROW = "flex gap-3";
export const WALLETS_HELP_ITEM_ICON = [
  "flex size-9 shrink-0 items-center justify-center rounded-xl",
  "bg-muted/70 text-foreground/85 dark:bg-muted/40",
].join(" ");

export const WALLETS_HELP_ITEMS: ReadonlyArray<{
  icon: WalletsHelpIconKey;
  title: string;
  body: string;
}> = [
  {
    icon: "tap",
    title: "Ketuk kartu",
    body: "Kartu naik sedikit. Ketuk lagi untuk edit. Ketuk di luar untuk tutup.",
  },
  {
    icon: "reorder",
    title: "Geser urutan",
    body: "Tarik ikon ⋮ di kanan tengah kartu. Urutan stack tersimpan otomatis.",
  },
  {
    icon: "pager",
    title: "Titik di bawah stack",
    body: "Pilih wallet tanpa mengubah urutan kartu.",
  },
  {
    icon: "add",
    title: "Tombol +",
    body: "Tambah wallet baru atau transfer antar wallet.",
  },
  {
    icon: "eye",
    title: "Sembunyikan nominal",
    body: "Icon mata di atas total menyembunyikan angka saldo.",
  },
  {
    icon: "wallet",
    title: "Total & default",
    body: "Total = jumlah semua wallet. Wallet default ada di belakang stack.",
  },
];
