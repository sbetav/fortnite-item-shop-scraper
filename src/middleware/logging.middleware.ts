import { Request, Response, NextFunction } from "express";

/**
 * Request logging middleware
 */
export const requestLogger = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const start = Date.now();
  const timestamp = new Date().toISOString();

  // Log request
  console.log(
    `[${timestamp}] ${req.method} ${req.path} - IP: ${req.ip} - User-Agent: ${
      req.get("User-Agent") || "Unknown"
    }`
  );

  // Override res.end to log response
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
 * Error logging middleware
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
