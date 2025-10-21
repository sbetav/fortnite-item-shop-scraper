import { Request, Response, NextFunction } from "express";

export interface AuthenticatedRequest extends Request {
  apiKey?: string;
}

/**
 * API Key authentication middleware
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
