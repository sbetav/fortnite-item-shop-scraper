import dotenv from "dotenv";
import express from "express";
import { BrowserService } from "./shared/browser/browser.service";
import { APP_CONFIG } from "./config/app.config";

// Load environment variables
dotenv.config();

// Import security middleware
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

// Import routes
import itemShopRoutes from "./features/item-shop/item-shop.routes";
import jamTracksRoutes from "./features/jam-tracks/jam-tracks.routes";

const app = express();
const PORT = APP_CONFIG.PORT;

// Security middleware (order matters!)
app.use(securityHeaders);
app.use(corsMiddleware);
app.use(requestLogger);
app.use(generalRateLimit);
app.use(express.json());

// API Key authentication for all API routes
app.use("/api", authenticateApiKey);

// Routes with specific rate limiting
app.use("/api/item-shop", scrapingRateLimit, itemShopRoutes);
app.use("/api/jam-tracks", scrapingRateLimit, jamTracksRoutes);

// Health check endpoint
app.get("/health", (_req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
  });
});

// Root endpoint
app.get("/", (_req, res) => {
  res.json({
    message: "Fortnite Item Shop Scraper API",
    endpoints: {
      "/api/item-shop":
        "GET - Scrape Fortnite item shop data (supports ?lang=XX parameter)",
      "/api/item-shop/languages": "GET - Get list of supported languages",
      "/api/item-shop/item/:assetType/:itemId":
        "GET - Scrape Fortnite item data (supports ?lang=XX parameter) (e.g., /api/item-shop/item/bundles/ravemello-35c6f4c5 or /api/item-shop/item/outfits/lycan-west-db80c774)",
      "/api/jam-tracks": "GET - Scrape Fortnite jam tracks data",
      "/api/jam-tracks (POST)":
        'POST - Process jam track URLs and return audio data. Body: { url: "qsep://..." }',
      "/api/jam-tracks/audio":
        'POST - Download jam track audio directly. Body: { url: "qsep://..." }',
      "/api/jam-tracks/stream":
        'POST - Stream jam track audio. Body: { url: "qsep://..." }',
      "/health": "GET - Health check",
    },
  });
});

// Error handling middleware
app.use(errorLogger);

// Graceful shutdown
async function shutdown() {
  console.log("Shutting down server...");
  try {
    const browserService = BrowserService.getInstance();
    await browserService.shutdown();
  } catch (error) {
    console.error("Error during shutdown:", error);
  }
  process.exit(0);
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

app
  .listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log("Available endpoints:");
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
  })
  .on("error", (error: any) => {
    console.error("Server failed to start:", error);
    process.exit(1);
  });
