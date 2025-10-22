/**
 * Item Shop Routes
 *
 * This module defines all HTTP routes for the item shop feature.
 * It handles requests for item shop data, individual items, and language support.
 * All routes require API key authentication and are subject to rate limiting.
 *
 * @fileoverview Express routes for Fortnite Item Shop Scraper API
 */

import { Router, Request, Response } from "express";
import { ItemShopService } from "./item-shop.service";
import { ApiResponse } from "../../shared/types/api.types";
import { SUPPORTED_LANGUAGES, DEFAULT_LANGUAGE } from "./item-shop.types";

const router = Router();
const itemShopService = new ItemShopService();

/**
 * GET /api/item-shop
 *
 * Fetches the complete Fortnite item shop data for the specified language.
 *
 * Query Parameters:
 * - lang (optional): Language code (defaults to 'en-US')
 *
 * Response:
 * - 200: Success with item shop data
 * - 500: Server error
 *
 * Rate Limit: 20 requests per 15 minutes
 */
router.get("/", async (req: Request, res: Response) => {
  try {
    const lang = (req.query.lang as string) || DEFAULT_LANGUAGE;

    // Validate language parameter against supported languages
    const validLang = SUPPORTED_LANGUAGES.includes(lang as any)
      ? lang
      : DEFAULT_LANGUAGE;

    const data = await itemShopService.scrapeItemShop(validLang as any);

    const response: ApiResponse = {
      success: true,
      data: data,
      timestamp: new Date().toISOString(),
    };

    return res.json(response);
  } catch (error: any) {
    console.error("Error in /api/item-shop:", error);
    const response: ApiResponse = {
      success: false,
      error: error.message,
      timestamp: new Date().toISOString(),
    };
    return res.status(500).json(response);
  }
});

/**
 * GET /api/item-shop/item/:assetType/:itemId
 *
 * Fetches detailed information for a specific item from the Fortnite item shop.
 *
 * Path Parameters:
 * - assetType: Type of asset (bundles, outfits, emotes, etc.)
 * - itemId: Unique identifier for the item
 *
 * Query Parameters:
 * - lang (optional): Language code (defaults to 'en-US')
 *
 * Response:
 * - 200: Success with item data
 * - 400: Bad request (missing parameters)
 * - 500: Server error
 *
 * Rate Limit: 20 requests per 15 minutes
 *
 * Examples:
 * - /api/item-shop/item/bundles/ravemello-35c6f4c5
 * - /api/item-shop/item/outfits/lycan-west-db80c774
 */
router.get("/item/:assetType/:itemId", async (req: Request, res: Response) => {
  try {
    const { assetType, itemId } = req.params;
    const lang = (req.query.lang as string) || DEFAULT_LANGUAGE;

    // Validate required parameters
    if (!assetType || !itemId) {
      const response: ApiResponse = {
        success: false,
        error: "Both assetType and itemId are required",
        timestamp: new Date().toISOString(),
      };
      return res.status(400).json(response);
    }

    // Validate language parameter against supported languages
    const validLang = SUPPORTED_LANGUAGES.includes(lang as any)
      ? lang
      : DEFAULT_LANGUAGE;

    const data = await itemShopService.scrapeItem(
      assetType,
      itemId,
      validLang as any
    );

    const response: ApiResponse = {
      success: true,
      data: data,
      timestamp: new Date().toISOString(),
    };

    return res.json(response);
  } catch (error: any) {
    console.error("Error in /api/item-shop/item:", error);
    const response: ApiResponse = {
      success: false,
      error: error.message,
      timestamp: new Date().toISOString(),
    };
    return res.status(500).json(response);
  }
});

/**
 * GET /api/item-shop/languages
 *
 * Returns the list of supported languages for the Fortnite API.
 * This endpoint does not require authentication and is not rate limited.
 *
 * Response:
 * - 200: Success with language information
 * - 500: Server error
 *
 * No authentication required
 * No rate limiting
 */
router.get("/languages", async (_req: Request, res: Response) => {
  try {
    const response: ApiResponse = {
      success: true,
      data: {
        supportedLanguages: SUPPORTED_LANGUAGES,
        defaultLanguage: DEFAULT_LANGUAGE,
      },
      timestamp: new Date().toISOString(),
    };

    return res.json(response);
  } catch (error: any) {
    console.error("Error in /api/item-shop/languages:", error);
    const response: ApiResponse = {
      success: false,
      error: error.message,
      timestamp: new Date().toISOString(),
    };
    return res.status(500).json(response);
  }
});

export default router;
