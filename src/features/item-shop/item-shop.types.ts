/**
 * Item Shop Types
 *
 * This module defines TypeScript interfaces and types for the Fortnite item shop
 * data structures. It includes support for multiple languages and defines the
 * structure of item shop data and individual items.
 *
 * @fileoverview Type definitions for Fortnite Item Shop Scraper API
 */

/**
 * Item Shop Data Interface
 *
 * Represents the complete item shop data structure returned by Fortnite's API.
 * The structure is dynamic and may vary based on the current shop contents.
 *
 * @interface ItemShopData
 */
export interface ItemShopData {
  /** Dynamic structure based on Fortnite API response */
  [key: string]: any;
}

/**
 * Individual Item Data Interface
 *
 * Represents data for a single item from the Fortnite item shop.
 * Used for detailed item information requests.
 *
 * @interface ItemData
 */
export interface ItemData {
  /** Dynamic structure for individual item data */
  [key: string]: any;
}

/**
 * Supported Language Type
 *
 * Union type representing all languages supported by the Fortnite API.
 * Each language code follows the BCP 47 format.
 */
export type SupportedLanguage =
  | "de" // Deutsch
  | "en-US" // English
  | "es-ES" // Español
  | "es-MX" // Español (Latinoamérica)
  | "fr" // Français
  | "it" // Italiano
  | "pl" // Polski
  | "pt-BR" // Português (Brasil)
  | "tr" // Türkçe
  | "ru" // Русский
  | "ar" // العربية
  | "ja" // 日本語
  | "zh-Hans" // 简体中文
  | "ko"; // 한국어

/**
 * Array of all supported languages
 *
 * This array contains all language codes that can be used with the Fortnite API.
 * It's used for validation and providing available options to clients.
 */
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

/**
 * Default Language
 *
 * The default language used when no language parameter is provided.
 * Set to English (United States) as it's the most widely supported.
 */
export const DEFAULT_LANGUAGE: SupportedLanguage = "en-US";
