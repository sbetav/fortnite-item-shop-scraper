import helmet from "helmet";
import cors from "cors";

/**
 * Security headers middleware
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
 * CORS configuration - Allow all origins (API key provides security)
 */
export const corsOptions = {
  origin: true, // Allow all origins - API key authentication provides security
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "x-api-key"],
};

export const corsMiddleware = cors(corsOptions);
