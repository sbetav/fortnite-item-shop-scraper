import { Router, Request, Response } from "express";
import { ItemShopService } from "./item-shop.service";
import { ApiResponse } from "../../shared/types/api.types";

const router = Router();
const itemShopService = new ItemShopService();

/**
 * Item shop endpoint
 */
router.get("/", async (_req: Request, res: Response) => {
  try {
    console.log("Received request for item shop data");
    const data = await itemShopService.scrapeItemShop();

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

    // Validate parameters
    if (!assetType || !itemId) {
      const response: ApiResponse = {
        success: false,
        error: "Both assetType and itemId are required",
        timestamp: new Date().toISOString(),
      };
      return res.status(400).json(response);
    }

    console.log(`Received request for item data: ${assetType}/${itemId}`);
    const data = await itemShopService.scrapeItem(assetType, itemId);

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

export default router;
