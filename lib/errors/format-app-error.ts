const DB_BUSY_PATTERNS = [
  "too many clients",
  "too many connections",
  "remaining connection slots",
  "connection limit",
  "max client connections",
] as const;

const DB_UNAVAILABLE_PATTERNS = [
  "econnrefused",
  "etimedout",
  "connection terminated",
  "connection timeout",
  "can't reach database",
  "failed to connect",
] as const;

import { isStaleDeploymentError } from "@/lib/errors/is-stale-deployment-error";

const AUTH_ERROR_MESSAGES: Record<string, string> = {
  access_denied: "Login dibatalkan.",
  configuration: "Login belum dikonfigurasi dengan benar. Hubungi admin.",
  oauth_error: "Gagal masuk dengan Google. Coba lagi.",
  oauth_callback_error: "Gagal menyelesaikan login Google. Coba lagi.",
  invalid_callback_url: "Alamat redirect tidak valid. Coba login ulang.",
  state_mismatch: "Sesi login kedaluwarsa. Coba lagi.",
  unable_to_create_user: "Akun tidak bisa dibuat. Coba email lain.",
  email_not_verified: "Email belum diverifikasi.",
  account_not_linked: "Akun Google belum terhubung. Coba login dengan email.",
};

function includesAny(text: string, patterns: readonly string[]): boolean {
  return patterns.some((pattern) => text.includes(pattern));
}

function readErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "string") {
    return error;
  }

  return "";
}

export function formatAuthErrorCode(
  code: string | null | undefined,
): string | null {
  if (!code?.trim()) {
    return null;
  }

  const normalized = code.trim().toLowerCase();
  return AUTH_ERROR_MESSAGES[normalized] ?? "Gagal masuk. Coba lagi.";
}

export function formatAppError(error: unknown): string {
  if (isStaleDeploymentError(error)) {
    return "Aplikasi baru saja diperbarui. Memuat versi terbaru…";
  }

  const message = readErrorMessage(error).toLowerCase();

  if (!message) {
    return "Terjadi kesalahan. Coba muat ulang halaman.";
  }

  if (includesAny(message, DB_BUSY_PATTERNS)) {
    return "Server sedang sibuk (batas koneksi database). Tunggu 10–20 detik lalu coba lagi.";
  }

  if (includesAny(message, DB_UNAVAILABLE_PATTERNS)) {
    return "Tidak bisa terhubung ke database. Coba lagi dalam beberapa detik.";
  }

  if (message.includes("database_url is not set")) {
    return "Database belum dikonfigurasi di server.";
  }

  return "Terjadi kesalahan. Coba muat ulang halaman.";
}
