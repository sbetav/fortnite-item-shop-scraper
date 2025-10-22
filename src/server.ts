/**
 * Fortnite Item Shop Scraper API Server
 *
 * This is the main server file that sets up the Express application with all middleware,
 * routes, and error handling. It provides a REST API for scraping Fortnite item shop
 * data and jam tracks from the official Fortnite website.
 *
 * Features:
 * - API key authentication
 * - Rate limiting for scraping endpoints
 * - Security headers and CORS
 * - Request/error logging
 * - Graceful shutdown handling
 *
 * @author Fortnite Item Shop Scraper Team
 * @version 1.0.0
 */

import dotenv from "dotenv";
import express from "express";
import { BrowserService } from "./shared/browser/browser.service";
import { APP_CONFIG } from "./config/app.config";
import { authenticateApiKey } from "./middleware/auth.middleware";
import {
  generalRateLimit,
  scrapingRateLimit,
} from "./middleware/rate-limit.middleware";
import {
  securityHeaders,
  corsMiddleware,
} from "./middleware/security.middleware";
import { requestLogger, errorLogger } from "./middleware/logging.middleware";

dotenv.config();

import itemShopRoutes from "./features/item-shop/item-shop.routes";
import jamTracksRoutes from "./features/jam-tracks/jam-tracks.routes";
const app = express();
const PORT = APP_CONFIG.PORT;

/**
 * Middleware Configuration
 *
 * The order of middleware is crucial for proper functionality:
 * 1. Security headers (helmet) - must be first
 * 2. CORS - handles cross-origin requests
 * 3. Request logging - logs all incoming requests
 * 4. Rate limiting - prevents abuse
 * 5. JSON parsing - parses request bodies
 * 6. API authentication - protects API routes
 * 7. Route-specific middleware and routes
 */

app.use(securityHeaders);
app.use(corsMiddleware);
app.use(requestLogger);
app.use(generalRateLimit);
app.use(express.json());
app.use("/api", authenticateApiKey);
app.use("/api/item-shop", scrapingRateLimit, itemShopRoutes);
app.use("/api/jam-tracks", scrapingRateLimit, jamTracksRoutes);

/**
 * Health Check Endpoint
 *
 * Simple endpoint to verify the server is running and responsive.
 * No authentication required.
 */
app.get("/health", (_req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
  });
});

/**
 * API Documentation Endpoint
 *
 * Provides a comprehensive overview of all available endpoints and their usage.
 * This serves as the main entry point for API discovery.
 */
app.get("/", (_req, res) => {
  res.json({
    message: "Fortnite Item Shop Scraper API",
    version: "1.0.0",
    description:
      "A REST API for scraping Fortnite item shop data and jam tracks",
    endpoints: {
      "/api/item-shop":
        "GET - Scrape Fortnite item shop data (supports ?lang=XX parameter)",
      "/api/item-shop/languages": "GET - Get list of supported languages",
      "/api/item-shop/item/:assetType/:itemId":
        "GET - Scrape Fortnite item data (supports ?lang=XX parameter). Examples: /api/item-shop/item/bundles/ravemello-35c6f4c5 or /api/item-shop/item/outfits/lycan-west-db80c774",
      "/api/jam-tracks": "GET - Scrape Fortnite jam tracks data",
      "/api/jam-tracks (POST)":
        'POST - Process jam track URLs and return audio data. Body: { url: "qsep://..." }',
      "/api/jam-tracks/audio":
        'POST - Download jam track audio directly. Body: { url: "qsep://..." }',
      "/api/jam-tracks/stream":
        'POST - Stream jam track audio. Body: { url: "qsep://..." }',
      "/health": "GET - Health check",
    },
    authentication: {
      required: "API key in x-api-key header for all /api/* endpoints",
      exceptions: ["/health", "/", "/api/item-shop/languages"],
    },
    rateLimits: {
      general: "100 requests per 15 minutes",
      scraping:
        "20 requests per 15 minutes for /api/item-shop and /api/jam-tracks",
    },
  });
});

app.use(errorLogger);

/**
 * Graceful Shutdown Handler
 *
 * Handles server shutdown gracefully by:
 * 1. Closing the browser service to free resources
 * 2. Allowing ongoing requests to complete
 * 3. Properly exiting the process
 */
async function shutdown() {
  console.log("Shutting down server...");
  try {
    const browserService = BrowserService.getInstance();
    await browserService.shutdown();
    console.log("Browser service shutdown complete");
  } catch (error) {
    console.error("Error during shutdown:", error);
  }
  process.exit(0);
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

/**
 * Start the server and handle startup events
 */
app
  .listen(PORT, "0.0.0.0", () => {
    console.log(
      `🚀 Fortnite Item Shop Scraper API Server running on http://localhost:${PORT}`
    );
    console.log("📋 Available endpoints:");
    console.log(
      "  GET /api/item-shop - Scrape Fortnite item shop (supports ?lang=XX)"
    );
    console.log("  GET /api/item-shop/languages - Get supported languages");
    console.log("  GET /api/jam-tracks - Scrape Fortnite jam tracks");
    console.log(
      "  GET /api/item-shop/item/:assetType/:itemId - Scrape Fortnite item data (supports ?lang=XX)"
    );
    console.log("  POST /api/jam-tracks - Process jam track URLs");
    console.log("  GET /health - Health check");
    console.log(
      "🔑 Authentication: Include 'x-api-key' header for API endpoints"
    );
    console.log(
      "⚡ Rate limits: 100 requests/15min general, 20 requests/15min for scraping"
    );
  })
  .on("error", (error: any) => {
    console.error("❌ Server failed to start:", error);
    process.exit(1);
  });
