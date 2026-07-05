import { GoogleGenAI } from "@google/genai";

import {
  GEMINI_API_KEY_ENV_KEYS,
} from "@/config/gemini";

function readGeminiApiKey(): string | undefined {
  for (const key of GEMINI_API_KEY_ENV_KEYS) {
    const value = process.env[key]?.trim();
    if (value) {
      return value;
    }
  }

  return undefined;
}

export function isGeminiConfigured(): boolean {
  return readGeminiApiKey() !== undefined;
}

let client: GoogleGenAI | null = null;

export function getGeminiClient(): GoogleGenAI {
  const apiKey = readGeminiApiKey();

  if (!apiKey) {
    throw new Error(
      "Gemini API key belum diset. Tambahkan GEMINI_API_KEY di .env.local.",
    );
  }

  client ??= new GoogleGenAI({ apiKey });

  return client;
}
