import rateLimit from "express-rate-limit";

/**
 * General rate limiting for all API endpoints
 */
export const generalRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    success: false,
    error: "Too many requests from this IP, please try again later.",
    timestamp: new Date().toISOString(),
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

/**
 * Strict rate limiting for scraping endpoints
 */
export const scrapingRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Limit each IP to 20 scraping requests per windowMs
  message: {
    success: false,
    error: "Too many scraping requests from this IP, please try again later.",
    timestamp: new Date().toISOString(),
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Very strict rate limiting for cache clearing
 */
export const cacheRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // Limit each IP to 5 cache operations per hour
  message: {
    success: false,
    error: "Too many cache operations from this IP, please try again later.",
    timestamp: new Date().toISOString(),
  },
  standardHeaders: true,
  legacyHeaders: false,
});
