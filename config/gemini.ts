/** Gemini model for inbox transaction parsing. */
export const GEMINI_MODEL = "gemini-2.5-flash";

/** Env keys checked in order — first defined value wins. */
export const GEMINI_API_KEY_ENV_KEYS = [
  "GEMINI_API_KEY",
  "GOOGLE_API_KEY",
] as const;

export const GEMINI_MAX_OUTPUT_TOKENS = 512;

/** Token budget for daily summary insight generation. */
export const GEMINI_DAILY_INSIGHT_MAX_OUTPUT_TOKENS = 256;
