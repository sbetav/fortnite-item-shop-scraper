/**
 * Authentication Middleware
 *
 * This module provides API key authentication for protecting API endpoints.
 * It validates the x-api-key header against the API_KEY environment variable.
 *
 * @fileoverview Authentication middleware for Fortnite Item Shop Scraper API
 */

import { Request, Response, NextFunction } from "express";

/**
 * Extended Request interface that includes the API key
 */
export interface AuthenticatedRequest extends Request {
  /** The validated API key from the request headers */
  apiKey?: string;
}

/**
 * API Key Authentication Middleware
 *
 * Validates the x-api-key header for API endpoints. Some endpoints are excluded
 * from authentication requirements (health check, root, languages).
 *
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next function
 *
 * @returns 401 Unauthorized if API key is missing or invalid
 * @returns Calls next() if authentication passes
 */
export const authenticateApiKey = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const apiKey = req.headers["x-api-key"] as string;
  const validApiKey = process.env.API_KEY;

  // Skip authentication for health check, root endpoints, and languages endpoint
  if (
    req.path === "/health" ||
    req.path === "/" ||
    req.path.endsWith("/languages")
  ) {
    return next();
  }

  // Skip authentication in development if no API key is set
  if (!validApiKey) {
    console.warn("API_KEY environment variable not set - API is unprotected!");
    return next();
  }

  if (!apiKey) {
    return res.status(401).json({
      success: false,
      error: "API key required. Include 'x-api-key' header.",
      timestamp: new Date().toISOString(),
    });
  }

  if (apiKey !== validApiKey) {
    return res.status(401).json({
      success: false,
      error: "Invalid API key",
      timestamp: new Date().toISOString(),
    });
  }

  req.apiKey = apiKey;
  next();
};
