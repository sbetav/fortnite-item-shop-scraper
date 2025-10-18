import { Router, Request, Response } from "express";
import { CacheService } from "./cache.service";
import { ApiResponse, CacheStatus } from "../../shared/types/api.types";

const router = Router();
const cacheService = CacheService.getInstance();

/**
 * Clear cache endpoint
 */
router.post("/clear", (req: Request, res: Response) => {
  const { type } = req.body;

  if (type === "itemShop" || type === "jamTracks") {
    cacheService.clearCache(type);
    const response: ApiResponse = {
      success: true,
      data: { message: `${type} cache cleared successfully` },
      timestamp: new Date().toISOString(),
    };
    res.json(response);
  } else if (type === "all" || !type) {
    cacheService.clearCache("all");
    const response: ApiResponse = {
      success: true,
      data: { message: "All caches cleared successfully" },
      timestamp: new Date().toISOString(),
    };
    res.json(response);
  } else {
    const response: ApiResponse = {
      success: false,
      error: "Invalid cache type. Use 'itemShop', 'jamTracks', or 'all'",
      timestamp: new Date().toISOString(),
    };
    res.status(400).json(response);
  }
});

/**
 * Cache status endpoint
 */
router.get("/status", (_req: Request, res: Response) => {
  const cacheStatus = cacheService.getCacheStatus();

  const response: ApiResponse<CacheStatus> = {
    success: true,
    data: {
      itemShop: cacheStatus.itemShop,
      jamTracks: cacheStatus.jamTracks,
      cacheSettings: {
        duration: "30 minutes",
        maxAge: 1800,
      },
    },
    timestamp: new Date().toISOString(),
  };

  res.json(response);
});

export default router;
