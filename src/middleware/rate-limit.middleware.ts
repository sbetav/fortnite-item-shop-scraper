/**
 * Rate Limiting Middleware
 *
 * This module provides rate limiting functionality to prevent API abuse and ensure
 * fair usage. It includes both general rate limiting and stricter limits for
 * resource-intensive scraping operations.
 *
 * @fileoverview Rate limiting middleware for Fortnite Item Shop Scraper API
 */

import rateLimit from "express-rate-limit";

/**
 * General Rate Limiting
 *
 * Applies to all API endpoints to prevent basic abuse.
 * Allows 100 requests per 15-minute window per IP address.
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
 * Scraping Rate Limiting
 *
 * Stricter rate limiting for resource-intensive scraping operations.
 * Allows 20 requests per 15-minute window per IP address.
 * Applied to /api/item-shop and /api/jam-tracks endpoints.
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
