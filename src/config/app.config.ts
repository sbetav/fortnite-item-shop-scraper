/**
 * Application configuration constants
 * 
 * This module contains all the configuration settings for the Fortnite Item Shop Scraper API.
 * It includes browser settings, timeouts, API endpoints, and other application-wide constants.
 */
export const APP_CONFIG = {
  /** Server port number - defaults to 3333 if not specified in environment */
  PORT: Number(process.env.PORT) || 3333,
  
  /** Browser timeout in milliseconds for page navigation and data fetching */
  BROWSER_TIMEOUT: 15000,
  
  /** Timeout for individual audio segment downloads in milliseconds */
  AUDIO_SEGMENT_TIMEOUT: 10000,
  
  /** User agent string to mimic a real browser when making requests */
  USER_AGENT:
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  
  /** Browser viewport dimensions for consistent rendering */
  VIEWPORT: { width: 1920, height: 1080 },
  
  /** Browser launch arguments for optimized performance and security */
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

/**
 * Fortnite API endpoints configuration
 * 
 * These endpoints are used to fetch data from Fortnite's official website.
 * The _data parameter specifies which route data to fetch from the Remix framework.
 */
export const API_ENDPOINTS = {
  /**
   * Get the item shop data endpoint URL
   * @param lang - Language code (defaults to 'en-US')
   * @returns Complete URL for item shop data
   */
  ITEM_SHOP: (lang: string = 'en-US') =>
    `https://www.fortnite.com/item-shop?lang=${lang}&_data=routes%2Fitem-shop._index`,
  
  /**
   * Get the jam tracks data endpoint URL
   * @param lang - Language code (defaults to 'en-US')
   * @returns Complete URL for jam tracks data
   */
  JAM_TRACKS: (lang: string = 'en-US') =>
    `https://www.fortnite.com/item-shop/jam-tracks?lang=${lang}&_data=routes%2Fitem-shop.jam-tracks._index`,
} as const;
