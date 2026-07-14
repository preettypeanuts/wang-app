import type { WalletType } from "@/types/wallet";

export const WALLETS_PAGE_TITLE = "Wallets";
export const WALLETS_PAGE_DESC =
  "Track balances per wallet — cash, bank, e-wallet.";
export const WALLETS_BACK_LABEL = "Overview";
export const WALLETS_ADD = "Add wallet";
export const WALLETS_EMPTY =
  "No wallets yet. Add one to start tracking balances per source.";
export const WALLETS_MANAGE = "Manage";
export const WALLETS_DEFAULT_BADGE = "Default";
export const WALLETS_TOTAL_LABEL = "Total across wallets";

export const WALLET_FORM_TITLE_NEW = "Add wallet";
export const WALLET_FORM_TITLE_EDIT = "Edit wallet";
export const WALLET_FORM_DESC =
  "Balance = initial balance plus transactions assigned to this wallet.";
export const WALLET_FORM_NAME = "Name";
export const WALLET_FORM_NAME_PLACEHOLDER = "Cash, BCA, GoPay...";
export const WALLET_FORM_TYPE = "Type";
export const WALLET_FORM_INITIAL_BALANCE = "Initial balance (IDR)";
export const WALLET_FORM_SAVE = "Save";
export const WALLET_FORM_SAVING = "Saving...";
export const WALLET_FORM_ARCHIVE = "Archive wallet";
export const WALLET_FORM_ARCHIVING = "Archiving...";
export const WALLET_FORM_ARCHIVE_HINT =
  "Archiving hides this wallet from pickers. Past transactions keep their history.";

export const WALLET_TYPE_LABELS: Record<WalletType, string> = {
  cash: "Cash",
  bank: "Bank",
  ewallet: "E-wallet",
  other: "Other",
};

export const WALLET_TYPE_ORDER: WalletType[] = [
  "cash",
  "bank",
  "ewallet",
  "other",
];

export const WALLET_TRANSFER_TITLE = "Transfer antar wallet";
export const WALLET_TRANSFER_DESC =
  "Pindahkan saldo antar wallet. Tidak dihitung sebagai pemasukan atau pengeluaran.";
export const WALLET_TRANSFER = "Transfer";
export const WALLET_TRANSFER_FROM = "Dari wallet";
export const WALLET_TRANSFER_TO = "Ke wallet";
export const WALLET_TRANSFER_AMOUNT = "Nominal (IDR)";
export const WALLET_TRANSFER_NOTE = "Catatan (opsional)";
export const WALLET_TRANSFER_NOTE_PLACEHOLDER = "Tarik tunai, top up, dll.";
export const WALLET_TRANSFER_SAVE = "Transfer";
export const WALLET_TRANSFER_SAVING = "Memproses...";

export const WALLETS_STARTER_TITLE = "Mulai dengan template";
export const WALLETS_STARTER_HINT =
  "Pilih jenis dompet umum — kamu bisa rename setelah dibuat.";
export const WALLETS_STARTER_CASH = "💵 Cash";
export const WALLETS_STARTER_BANK = "🏦 Rekening Bank";
export const WALLETS_STARTER_EWALLET = "📱 E-Wallet";

export const WALLET_FORM_SET_DEFAULT = "Jadikan default";
export const WALLET_FORM_SETTING_DEFAULT = "Menyimpan...";
export const WALLET_FORM_ARCHIVE_DEFAULT_NOTICE =
  "Wallet ini sedang jadi default. Pilih wallet lain sebagai default dulu sebelum mengarsipkan wallet ini.";

export const WALLET_ADJUST = "Sesuaikan Saldo";
export const WALLET_ADJUST_TITLE = "Sesuaikan saldo";
export const WALLET_ADJUST_DESC =
  "Koreksi selisih antara saldo terhitung dan saldo riil di bank/e-wallet.";
export const WALLET_ADJUST_COMPUTED = "Saldo terhitung";
export const WALLET_ADJUST_TARGET = "Saldo sebenarnya sekarang (IDR)";
export const WALLET_ADJUST_DIFF = "Selisih:";
export const WALLET_ADJUST_NOTE = "Catatan (opsional)";
export const WALLET_ADJUST_NOTE_PLACEHOLDER = "Cek mutasi bank, selisih kas fisik...";
export const WALLET_ADJUST_SAVE = "Simpan penyesuaian";
export const WALLET_ADJUST_SAVING = "Menyimpan...";
