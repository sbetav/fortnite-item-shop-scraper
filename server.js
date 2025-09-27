const express = require("express");
const { chromium } = require("playwright");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3333;

// Middleware
app.use(cors());
app.use(express.json());

// Store browser instance for reuse
let browser = null;

// Initialize browser
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
      ],
    });
  }
  return browser;
}

// Scrape Fortnite item shop
async function scrapeItemShop() {
  const browser = await initBrowser();
  const context = await browser.newContext({
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    viewport: { width: 1920, height: 1080 },
  });

  const page = await context.newPage();

  try {
    console.log("Navigating to Fortnite item shop...");

    // Navigate to the Fortnite item shop API endpoint
    const url =
      "https://www.fortnite.com/item-shop?lang=en-US&_data=routes%2Fitem-shop._index";

    await page.goto(url, {
      waitUntil: "networkidle",
      timeout: 30000,
    });

    // Wait for the page to load and handle any Cloudflare challenges
    await page.waitForTimeout(5000);

    // Try to get the JSON response from the page
    let data;
    try {
      // Look for JSON data in the page content
      const jsonContent = await page.evaluate(() => {
        // Try to find JSON data in script tags or page content
        const scripts = document.querySelectorAll("script");
        for (let script of scripts) {
          const content = script.textContent;
          if (
            content.includes('"items"') ||
            content.includes('"daily"') ||
            content.includes('"featured"')
          ) {
            try {
              return JSON.parse(content);
            } catch (e) {
              // Try to extract JSON from the content
              const jsonMatch = content.match(/\{[\s\S]*\}/);
              if (jsonMatch) {
                try {
                  return JSON.parse(jsonMatch[0]);
                } catch (e2) {
                  continue;
                }
              }
            }
          }
        }
        return null;
      });

      if (jsonContent) {
        data = jsonContent;
      } else {
        // Fallback: get the raw page content
        const pageContent = await page.content();
        data = { raw: pageContent };
      }
    } catch (error) {
      console.error("Error extracting JSON:", error);
      // Fallback to page content
      const pageContent = await page.content();
      data = { raw: pageContent, error: "Failed to parse JSON" };
    }

    await context.close();
    return data;
  } catch (error) {
    console.error("Error scraping item shop:", error);
    await context.close();
    throw error;
  }
}

// API endpoint
app.get("/api/item-shop", async (req, res) => {
  try {
    console.log("Received request for item shop data");
    const data = await scrapeItemShop();

    res.json({
      success: true,
      data: data,
      timestamp: new Date().toISOString(),
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

// Root endpoint
app.get("/", (req, res) => {
  res.json({
    message: "Fortnite Item Shop Scraper API",
    endpoints: {
      "/api/item-shop": "GET - Scrape Fortnite item shop data",
      "/health": "GET - Health check",
    },
  });
});

// Graceful shutdown
process.on("SIGINT", async () => {
  console.log("Shutting down server...");
  if (browser) {
    await browser.close();
  }
  process.exit(0);
});

process.on("SIGTERM", async () => {
  console.log("Shutting down server...");
  if (browser) {
    await browser.close();
  }
  process.exit(0);
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log("Available endpoints:");
  console.log("  GET /api/item-shop - Scrape Fortnite item shop");
  console.log("  GET /health - Health check");
});
