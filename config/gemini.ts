/** Gemini model for inbox transaction parsing. */
export const GEMINI_MODEL = "gemini-2.5-flash";

/** Lighter fallback when primary model quota is exceeded (receipt OCR only). */
export const GEMINI_RECEIPT_FALLBACK_MODEL = "gemini-2.5-flash-lite";

/** Env keys checked in order — first defined value wins. */
export const GEMINI_API_KEY_ENV_KEYS = [
  "GEMINI_API_KEY",
  "GOOGLE_API_KEY",
] as const;

export const GEMINI_MAX_OUTPUT_TOKENS = 512;

/** Token budget for receipt OCR + extraction. */
export const GEMINI_RECEIPT_MAX_OUTPUT_TOKENS = 768;

/** Token budget for inbox transaction assistant replies. */
export const GEMINI_INBOX_REPLY_MAX_OUTPUT_TOKENS = 256;

/** Token budget for daily summary insight generation. */
export const GEMINI_DAILY_INSIGHT_MAX_OUTPUT_TOKENS = 512;
