import { Router, Request, Response } from "express";
import { ItemShopService } from "./item-shop.service";
import { ApiResponse } from "../../shared/types/api.types";
import { SUPPORTED_LANGUAGES, DEFAULT_LANGUAGE } from "./item-shop.types";

const router = Router();
const itemShopService = new ItemShopService();

/**
 * Item shop endpoint
 */
router.get("/", async (req: Request, res: Response) => {
  try {
    const lang = (req.query.lang as string) || DEFAULT_LANGUAGE;

    // Validate language parameter
    const validLang = SUPPORTED_LANGUAGES.includes(lang as any)
      ? lang
      : DEFAULT_LANGUAGE;

    console.log(
      `Received request for item shop data with language: ${validLang}`
    );
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
 * Individual item endpoint
 */
router.get("/item/:assetType/:itemId", async (req: Request, res: Response) => {
  try {
    const { assetType, itemId } = req.params;
    const lang = (req.query.lang as string) || DEFAULT_LANGUAGE;

    // Validate parameters
    if (!assetType || !itemId) {
      const response: ApiResponse = {
        success: false,
        error: "Both assetType and itemId are required",
        timestamp: new Date().toISOString(),
      };
      return res.status(400).json(response);
    }

    // Validate language parameter
    const validLang = SUPPORTED_LANGUAGES.includes(lang as any)
      ? lang
      : DEFAULT_LANGUAGE;

    console.log(
      `Received request for item data: ${assetType}/${itemId} with language: ${validLang}`
    );
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
    console.error("Error in /api/item:", error);
    const response: ApiResponse = {
      success: false,
      error: error.message,
      timestamp: new Date().toISOString(),
    };
    return res.status(500).json(response);
  }
});

/**
 * Supported languages endpoint
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
