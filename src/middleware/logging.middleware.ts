/**
 * Logging Middleware
 *
 * This module provides request and error logging functionality for the API.
 * It logs incoming requests with timing information and handles error logging
 * for debugging and monitoring purposes.
 *
 * @fileoverview Logging middleware for Fortnite Item Shop Scraper API
 */

import { Request, Response, NextFunction } from "express";

/**
 * Request Logging Middleware
 *
 * Logs all incoming HTTP requests with the following information:
 * - Timestamp
 * - HTTP method and path
 * - Client IP address
 * - User-Agent header
 * - Response status code and duration
 *
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next function
 */
export const requestLogger = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const start = Date.now();
  const timestamp = new Date().toISOString();

  console.log(
    `[${timestamp}] ${req.method} ${req.path} - IP: ${req.ip} - User-Agent: ${
      req.get("User-Agent") || "Unknown"
    }`
  );
  const originalEnd = res.end;
  res.end = function (chunk?: any, encoding?: any, cb?: any) {
    const duration = Date.now() - start;
    const statusCode = res.statusCode;

    console.log(
      `[${timestamp}] ${req.method} ${req.path} - ${statusCode} - ${duration}ms`
    );

    return originalEnd.call(this, chunk, encoding, cb);
  };

  next();
};

/**
 * Error Logging Middleware
 *
 * Logs application errors with detailed information including:
 * - Timestamp
 * - Error message
 * - Stack trace
 *
 * This middleware should be placed after all routes to catch any unhandled errors.
 *
 * @param err - The error object
 * @param _req - Express request object (unused)
 * @param _res - Express response object (unused)
 * @param next - Express next function
 */
export const errorLogger = (
  err: Error,
  _req: Request,
  _res: Response,
  next: NextFunction
) => {
  const timestamp = new Date().toISOString();
  console.error(`[${timestamp}] ERROR: ${err.message}`);
  console.error(`[${timestamp}] Stack: ${err.stack}`);
  next(err);
};
