/**
 * Security Middleware
 *
 * This module provides security-related middleware including security headers
 * and CORS configuration. It uses helmet for security headers and cors for
 * cross-origin request handling.
 *
 * @fileoverview Security middleware for Fortnite Item Shop Scraper API
 */

import helmet from "helmet";
import cors from "cors";

/**
 * Security Headers Middleware
 *
 * Configures security headers using helmet middleware to protect against
 * common web vulnerabilities like XSS, clickjacking, and MIME type sniffing.
 *
 * @see https://helmetjs.github.io/ for more information
 */
export const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  crossOriginEmbedderPolicy: false, // Disable for API endpoints
});

/**
 * CORS Configuration
 *
 * Cross-Origin Resource Sharing configuration that allows all origins
 * since API key authentication provides the primary security layer.
 *
 * @see https://expressjs.com/en/resources/middleware/cors.html for more information
 */
export const corsOptions = {
  origin: true, // Allow all origins - API key authentication provides security
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "x-api-key"],
};

/**
 * CORS Middleware
 *
 * Express middleware for handling Cross-Origin Resource Sharing (CORS) requests.
 * Applied to all routes to allow cross-origin requests from web applications.
 */
export const corsMiddleware = cors(corsOptions);
