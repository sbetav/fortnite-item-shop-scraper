const express = require("express");
const { chromium } = require("playwright");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3333;

// Middleware
app.use(cors());
app.use(express.json());

// Store browser instance and context for reuse
let browser = null;
let context = null;

// Simple in-memory cache with shop-aware expiration
const cache = {
  itemShop: {
    data: null,
    timestamp: null,
  },
  jamTracks: {
    data: null,
    timestamp: null,
  },
};

// Calculate next shop refresh time (7:00 PM GMT-5 daily)
function getNextShopRefresh() {
  const now = new Date();
  const refreshTime = new Date();

  // Set to 7:00 PM GMT-5 (which is midnight UTC)
  refreshTime.setUTCHours(0, 0, 0, 0);

  // If current time is past today's refresh, set to tomorrow's refresh
  if (now >= refreshTime) {
    refreshTime.setUTCDate(refreshTime.getUTCDate() + 1);
  }

  return refreshTime;
}

// Initialize browser with optimized settings
async function initBrowser() {
  if (!browser) {
    browser = await chromium.launch({
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-accelerated-2d-canvas",
        "--no-first-run",
        "--no-zygote",
        "--disable-gpu",
        "--disable-background-timer-throttling",
        "--disable-backgrounding-occluded-windows",
        "--disable-renderer-backgrounding",
      ],
    });

    // Create persistent context
    context = await browser.newContext({
      userAgent:
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      viewport: { width: 1920, height: 1080 },
    });
  }
  return { browser, context };
}

// Get the most recent shop refresh time (7:00 PM GMT-5)
function getLastShopRefresh() {
  const now = new Date();
  const lastRefresh = new Date();

  // Set to 7:00 PM GMT-5 (which is midnight UTC)
  lastRefresh.setUTCHours(0, 0, 0, 0);

  // If current time is before today's refresh, use yesterday's refresh
  if (now < lastRefresh) {
    lastRefresh.setUTCDate(lastRefresh.getUTCDate() - 1);
  }

  return lastRefresh;
}

// Check cache validity based on 30-minute expiration
function isCacheValid(cacheType = "itemShop") {
  const cacheData = cache[cacheType];
  if (!cacheData.data || !cacheData.timestamp) {
    return false;
  }

  const cacheTime = new Date(cacheData.timestamp);
  const now = new Date();
  const thirtyMinutesAgo = new Date(now.getTime() - 30 * 60 * 1000);

  // Cache is valid if it was created within the last 30 minutes
  return cacheTime > thirtyMinutesAgo;
}

// Get time until next shop refresh in seconds
function getSecondsUntilRefresh() {
  const nextRefresh = getNextShopRefresh();
  return Math.floor((nextRefresh.getTime() - Date.now()) / 1000);
}

// Common scraping function for Fortnite data
async function scrapeFortniteData(url, cacheType = "itemShop") {
  // Return cached data if valid
  if (isCacheValid(cacheType)) {
    console.log(`Returning cached ${cacheType} data`);
    return cache[cacheType].data;
  }

  const { context: browserContext } = await initBrowser();
  const page = await browserContext.newPage();

  try {
    console.log(`Fetching fresh ${cacheType} data...`);

    // Direct API request - this is the most efficient approach
    const response = await page.goto(url, {
      waitUntil: "domcontentloaded",
      timeout: 15000,
    });

    const contentType = response.headers()["content-type"] || "";

    let data;

    // Direct JSON response
    data = await response.json();

    // Cache the successful response
    cache[cacheType].data = data;
    cache[cacheType].timestamp = Date.now();

    await page.close();
    return data;
  } catch (error) {
    await page.close();
    console.error(`Error scraping ${cacheType}:`, error);
    throw error;
  }
}

// Optimized scraping function for item shop
async function scrapeItemShop() {
  return await scrapeFortniteData(
    "https://www.fortnite.com/item-shop?lang=en-US&_data=routes%2Fitem-shop._index",
    "itemShop"
  );
}

// Scraping function for jam tracks
async function scrapeJamTracks() {
  return await scrapeFortniteData(
    "https://www.fortnite.com/item-shop/jam-tracks?lang=en-US&_data=routes%2Fitem-shop.jam-tracks._index",
    "jamTracks"
  );
}

// Scraping function for individual items (no caching)
async function scrapeItem(assetType, itemId) {
  // For bundles, use hardcoded "bundles" in the _data parameter
  // For other asset types, use %24assetType (which is $assetType)
  const dataParam =
    assetType === "bundles"
      ? `routes%2Fitem-shop.bundles.%24bundleName`
      : `routes%2Fitem-shop.%24assetType.%24assetName`;

  const url = `https://www.fortnite.com/item-shop/${assetType}/${itemId}?lang=en-US&_data=${dataParam}`;

  const { context: browserContext } = await initBrowser();
  const page = await browserContext.newPage();

  try {
    console.log(`Fetching fresh item data for ${assetType}/${itemId}...`);

    // Direct API request
    const response = await page.goto(url, {
      waitUntil: "domcontentloaded",
      timeout: 15000,
    });

    const data = await response.json();

    await page.close();
    return data;
  } catch (error) {
    await page.close();
    console.error(`Error scraping item ${assetType}/${itemId}:`, error);
    throw error;
  }
}

// API endpoint with shop-aware caching
app.get("/api/item-shop", async (req, res) => {
  try {
    console.log("Received request for item shop data");
    const data = await scrapeItemShop();

    // Set cache headers to 30 minutes
    res.set("Cache-Control", "public, max-age=1800");

    res.json({
      success: true,
      data: data,
      timestamp: new Date().toISOString(),
      cached: isCacheValid("itemShop"),
      cacheInfo: {
        expiresIn: "30 minutes",
        cacheDuration: "30 minutes",
      },
    });
  } catch (error) {
    console.error("Error in /api/item-shop:", error);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

// API endpoint for jam tracks
app.get("/api/jam-tracks", async (req, res) => {
  try {
    console.log("Received request for jam tracks data");
    const data = await scrapeJamTracks();

    // Set cache headers to 30 minutes
    res.set("Cache-Control", "public, max-age=1800");

    res.json({
      success: true,
      data: data,
      timestamp: new Date().toISOString(),
      cached: isCacheValid("jamTracks"),
      cacheInfo: {
        expiresIn: "30 minutes",
        cacheDuration: "30 minutes",
      },
    });
  } catch (error) {
    console.error("Error in /api/jam-tracks:", error);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

// API endpoint for individual items
app.get("/api/item/:assetType/:itemId", async (req, res) => {
  try {
    const { assetType, itemId } = req.params;

    // Validate parameters
    if (!assetType || !itemId) {
      return res.status(400).json({
        success: false,
        error: "Both assetType and itemId are required",
        timestamp: new Date().toISOString(),
      });
    }

    console.log(`Received request for item data: ${assetType}/${itemId}`);
    const data = await scrapeItem(assetType, itemId);

    res.json({
      success: true,
      data: data,
      assetType: assetType,
      itemId: itemId,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error in /api/item:", error);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
  });
});

// Cache management endpoint
app.post("/api/cache/clear", (req, res) => {
  const { type } = req.body;

  if (type === "itemShop" || type === "jamTracks") {
    cache[type].data = null;
    cache[type].timestamp = null;
    res.json({
      success: true,
      message: `${type} cache cleared successfully`,
      timestamp: new Date().toISOString(),
    });
  } else if (type === "all" || !type) {
    cache.itemShop.data = null;
    cache.itemShop.timestamp = null;
    cache.jamTracks.data = null;
    cache.jamTracks.timestamp = null;
    res.json({
      success: true,
      message: "All caches cleared successfully",
      timestamp: new Date().toISOString(),
    });
  } else {
    res.status(400).json({
      success: false,
      error: "Invalid cache type. Use 'itemShop', 'jamTracks', or 'all'",
      timestamp: new Date().toISOString(),
    });
  }
});

// Cache status endpoint
app.get("/api/cache/status", (req, res) => {
  res.json({
    success: true,
    cache: {
      itemShop: {
        hasData: !!cache.itemShop.data,
        timestamp: cache.itemShop.timestamp,
        isValid: isCacheValid("itemShop"),
      },
      jamTracks: {
        hasData: !!cache.jamTracks.data,
        timestamp: cache.jamTracks.timestamp,
        isValid: isCacheValid("jamTracks"),
      },
    },
    cacheSettings: {
      duration: "30 minutes",
      maxAge: 1800,
    },
    timestamp: new Date().toISOString(),
  });
});

// Root endpoint
app.get("/", (req, res) => {
  res.json({
    message: "Fortnite Item Shop Scraper API",
    endpoints: {
      "/api/item-shop": "GET - Scrape Fortnite item shop data",
      "/api/jam-tracks": "GET - Scrape Fortnite jam tracks data",
      "/api/item/:assetType/:itemId":
        "GET - Scrape Fortnite item data (e.g., /api/item/bundles/ravemello-35c6f4c5 or /api/item/outfits/lycan-west-db80c774)",
      "/api/cache/status": "GET - Check cache status and shop schedule",
      "/api/cache/clear":
        "POST - Clear cache (force fresh data). Body: { type: 'itemShop'|'jamTracks'|'all' }",
      "/health": "GET - Health check",
    },
  });
});

// Graceful shutdown
async function shutdown() {
  console.log("Shutting down server...");
  try {
    if (context) {
      await context.close();
    }
    if (browser) {
      await browser.close();
    }
  } catch (error) {
    console.error("Error during shutdown:", error);
  }
  process.exit(0);
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log("Available endpoints:");
  console.log("  GET /api/item-shop - Scrape Fortnite item shop");
  console.log("  GET /api/jam-tracks - Scrape Fortnite jam tracks");
  console.log("  GET /api/item/:assetType/:itemId - Scrape Fortnite item data");
  console.log("  GET /health - Health check");
});
