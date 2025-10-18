export const APP_CONFIG = {
  PORT: Number(process.env.PORT) || 3333,
  CACHE_DURATION_MINUTES: 30,
  CACHE_DURATION_MS: 30 * 60 * 1000,
  BROWSER_TIMEOUT: 15000,
  AUDIO_SEGMENT_TIMEOUT: 10000,
  USER_AGENT:
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  VIEWPORT: { width: 1920, height: 1080 },
  BROWSER_ARGS: [
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
} as const;

export const API_ENDPOINTS = {
  ITEM_SHOP:
    "https://www.fortnite.com/item-shop?lang=en-US&_data=routes%2Fitem-shop._index",
  JAM_TRACKS:
    "https://www.fortnite.com/item-shop/jam-tracks?lang=en-US&_data=routes%2Fitem-shop.jam-tracks._index",
} as const;
