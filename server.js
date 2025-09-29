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
  data: null,
  timestamp: null,
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

// Check cache validity based on shop refresh schedule
function isCacheValid() {
  if (!cache.data || !cache.timestamp) {
    return false;
  }

  const lastRefresh = getLastShopRefresh();
  const cacheTime = new Date(cache.timestamp);

  // Cache is valid only if it was created after the last shop refresh
  return cacheTime > lastRefresh;
}

// Get time until next shop refresh in seconds
function getSecondsUntilRefresh() {
  const nextRefresh = getNextShopRefresh();
  return Math.floor((nextRefresh.getTime() - Date.now()) / 1000);
}

// Optimized scraping function
async function scrapeItemShop() {
  // Return cached data if valid
  if (isCacheValid()) {
    console.log("Returning cached data");
    return cache.data;
  }

  const { context: browserContext } = await initBrowser();
  const page = await browserContext.newPage();

  try {
    console.log("Fetching fresh item shop data...");

    // Direct API request - this is the most efficient approach
    const response = await page.goto(
      "https://www.fortnite.com/item-shop?lang=en-US&_data=routes%2Fitem-shop._index",
      {
        waitUntil: "domcontentloaded",
        timeout: 15000,
      }
    );

    const contentType = response.headers()["content-type"] || "";

    let data;

    // Direct JSON response
    data = await response.json();

    // Cache the successful response
    cache.data = data;
    cache.timestamp = Date.now();

    await page.close();
    return data;
  } catch (error) {
    await page.close();
    console.error("Error scraping item shop:", error);
    throw error;
  }
}

// API endpoint with shop-aware caching
app.get("/api/item-shop", async (req, res) => {
  try {
    console.log("Received request for item shop data");
    const data = await scrapeItemShop();
    const nextRefresh = getNextShopRefresh();
    const secondsUntilRefresh = getSecondsUntilRefresh();

    // Set cache headers based on shop refresh schedule
    if (secondsUntilRefresh > 0) {
      res.set("Cache-Control", `public, max-age=${secondsUntilRefresh}`);
    }

    res.json({
      success: true,
      data: data,
      timestamp: new Date().toISOString(),
      cached: isCacheValid(),
      shopInfo: {
        nextRefresh: nextRefresh.toISOString(),
        refreshesIn: `${Math.floor(secondsUntilRefresh / 3600)}h ${Math.floor(
          (secondsUntilRefresh % 3600) / 60
        )}m`,
        refreshTime: "7:00 PM GMT-5 daily",
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

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
  });
});

// Cache management endpoint
app.post("/api/cache/clear", (req, res) => {
  cache.data = null;
  cache.timestamp = null;

  res.json({
    success: true,
    message: "Cache cleared successfully",
    timestamp: new Date().toISOString(),
  });
});

// Cache status endpoint
app.get("/api/cache/status", (req, res) => {
  const lastRefresh = getLastShopRefresh();
  const nextRefresh = getNextShopRefresh();

  res.json({
    success: true,
    cache: {
      hasData: !!cache.data,
      timestamp: cache.timestamp,
      isValid: isCacheValid(),
    },
    shopSchedule: {
      lastRefresh: lastRefresh.toISOString(),
      nextRefresh: nextRefresh.toISOString(),
      secondsUntilRefresh: getSecondsUntilRefresh(),
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
      "/api/cache/status": "GET - Check cache status and shop schedule",
      "/api/cache/clear": "POST - Clear cache (force fresh data)",
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
  console.log("  GET /health - Health check");
});
