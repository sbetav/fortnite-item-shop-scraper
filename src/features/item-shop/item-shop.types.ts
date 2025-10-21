export interface ItemShopData {
  // Define the structure based on Fortnite API response
  [key: string]: any;
}

export interface ItemData {
  // Define the structure for individual item data
  [key: string]: any;
}

// Supported languages for Fortnite API
export type SupportedLanguage =
  | "de"
  | "en-US"
  | "es-ES"
  | "es-MX"
  | "fr"
  | "it"
  | "pl"
  | "pt-BR"
  | "tr"
  | "ru"
  | "ar"
  | "ja"
  | "zh-Hans"
  | "ko";

export const SUPPORTED_LANGUAGES: SupportedLanguage[] = [
  "de",
  "en-US",
  "es-ES",
  "es-MX",
  "fr",
  "it",
  "pl",
  "pt-BR",
  "tr",
  "ru",
  "ar",
  "ja",
  "zh-Hans",
  "ko",
];

export const DEFAULT_LANGUAGE: SupportedLanguage = "en-US";
