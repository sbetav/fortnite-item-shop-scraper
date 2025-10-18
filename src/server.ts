import express from "express";
import cors from "cors";
import { BrowserService } from "./shared/browser/browser.service";
import { APP_CONFIG } from "./config/app.config";

// Import routes
import itemShopRoutes from "./features/item-shop/item-shop.routes";
import jamTracksRoutes from "./features/jam-tracks/jam-tracks.routes";
import cacheRoutes from "./features/cache/cache.routes";

const app = express();
const PORT = APP_CONFIG.PORT;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/item-shop", itemShopRoutes);
app.use("/api/jam-tracks", jamTracksRoutes);
app.use("/api/cache", cacheRoutes);

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
      "/api/item-shop": "GET - Scrape Fortnite item shop data",
      "/api/jam-tracks": "GET - Scrape Fortnite jam tracks data",
      "/api/item-shop/item/:assetType/:itemId":
        "GET - Scrape Fortnite item data (e.g., /api/item-shop/item/bundles/ravemello-35c6f4c5 or /api/item-shop/item/outfits/lycan-west-db80c774)",
      "/api/jam-tracks (POST)":
        'POST - Process jam track URLs and return audio data. Body: { url: "qsep://..." }',
      "/api/jam-tracks/audio":
        'POST - Download jam track audio directly. Body: { url: "qsep://..." }',
      "/api/jam-tracks/stream":
        'POST - Stream jam track audio. Body: { url: "qsep://..." }',
      "/api/cache/status": "GET - Check cache status and shop schedule",
      "/api/cache/clear":
        'POST - Clear cache (force fresh data). Body: { type: "itemShop"|"jamTracks"|"all" }',
      "/health": "GET - Health check",
    },
  });
});

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
    console.log(`Server running on http://0.0.0.0:${PORT}`);
    console.log("Available endpoints:");
    console.log("  GET /api/item-shop - Scrape Fortnite item shop");
    console.log("  GET /api/jam-tracks - Scrape Fortnite jam tracks");
    console.log(
      "  GET /api/item-shop/item/:assetType/:itemId - Scrape Fortnite item data"
    );
    console.log("  POST /api/jam-tracks - Process jam track URLs");
    console.log("  GET /health - Health check");
  })
  .on("error", (error: any) => {
    console.error("Server failed to start:", error);
    process.exit(1);
  });
