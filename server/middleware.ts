import { Request, Response, NextFunction } from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import cors from "cors";
import compression from "compression";
import { z } from "zod";
import { 
  AppError, 
  ValidationError, 
  AuthenticationError, 
  RateLimitError,
  formatErrorResponse,
  asyncHandler 
} from "../shared/errors";
import { logger, generateRequestId } from "../shared/logger";
import { securityConfig, serverConfig, featureFlags } from "../shared/config";

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      requestId: string;
      startTime: number;
      user?: any;
      validatedBody?: any;
      validatedQuery?: any;
      validatedParams?: any;
    }
  }
}

// Request ID middleware
export const requestIdMiddleware = (req: Request, res: Response, next: NextFunction) => {
  req.requestId = generateRequestId();
  res.setHeader("X-Request-ID", req.requestId);
  req.startTime = Date.now();
  next();
};

// Request logging middleware
export const requestLoggingMiddleware = (req: Request, res: Response, next: NextFunction) => {
  if (!featureFlags.requestLogging) {
    return next();
  }

  const originalSend = res.send;
  
  res.send = function(data) {
    const duration = Date.now() - req.startTime;
    logger.logRequest(req, res, duration);
    return originalSend.call(this, data);
  };

  next();
};

// Security middleware
export const securityMiddleware = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:", "blob:"],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'", "ws:", "wss:"],
    },
  },
  crossOriginEmbedderPolicy: false,
});

// CORS middleware
export const corsMiddleware = cors({
  origin: (origin, callback) => {
    if (!origin || serverConfig.corsOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "X-Request-ID"],
});

// Compression middleware
export const compressionMiddleware = compression({
  filter: (req, res) => {
    if (req.headers["x-no-compression"]) {
      return false;
    }
    return compression.filter(req, res);
  },
  threshold: 1024, // Only compress if size > 1KB
});

// Rate limiting middleware
export const rateLimitMiddleware = rateLimit({
  windowMs: securityConfig.rateLimitWindow,
  max: securityConfig.rateLimitMax,
  message: "Too many requests from this IP, please try again later",
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    const error = new RateLimitError(
      securityConfig.rateLimitMax,
      securityConfig.rateLimitWindow,
      req.requestId
    );
    
    logger.warn("Rate limit exceeded", {
      ip: req.ip,
      userAgent: req.get("User-Agent"),
      requestId: req.requestId,
    });
    
    res.status(error.statusCode).json(formatErrorResponse(error));
  },
  skip: (req) => {
    // Skip rate limiting in development or if disabled
    return !featureFlags.rateLimiting || serverConfig.nodeEnv === "development";
  },
});

// Maintenance mode middleware
export const maintenanceModeMiddleware = (req: Request, res: Response, next: NextFunction) => {
  if (featureFlags.maintenanceMode && !req.path.startsWith("/health")) {
    return res.status(503).json({
      success: false,
      error: {
        code: "MAINTENANCE_MODE",
        message: "Service temporarily unavailable for maintenance",
      },
      timestamp: new Date().toISOString(),
    });
  }
  next();
};

// Request timeout middleware
export const timeoutMiddleware = (timeout: number = 30000) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const timer = setTimeout(() => {
      if (!res.headersSent) {
        const error = new AppError(
          "REQUEST_TIMEOUT" as any,
          "Request timeout",
          408,
          { timeout },
          req.requestId
        );
        res.status(408).json(formatErrorResponse(error));
      }
    }, timeout);

    res.on("finish", () => clearTimeout(timer));
    res.on("close", () => clearTimeout(timer));
    
    next();
  };
};

// Body size limit middleware
export const bodySizeLimitMiddleware = (limit: string = "10mb") => {
  return (req: Request, res: Response, next: NextFunction) => {
    const contentLength = req.get("content-length");
    const maxSize = parseSize(limit);
    
    if (contentLength && parseInt(contentLength) > maxSize) {
      const error = new ValidationError(
        "Request body too large",
        "body",
        { limit, received: contentLength },
        req.requestId
      );
      return res.status(413).json(formatErrorResponse(error));
    }
    
    next();
  };
};

// Helper function to parse size strings
function parseSize(str: string): number {
  const units: { [key: string]: number } = {
    b: 1,
    kb: 1024,
    mb: 1024 * 1024,
    gb: 1024 * 1024 * 1024,
  };
  
  const match = str.toLowerCase().match(/^(\d+(?:\.\d+)?)\s*(b|kb|mb|gb)?$/);
  if (!match) return 0;
  
  const value = parseFloat(match[1]);
  const unit = match[2] || "b";
  
  return Math.floor(value * units[unit]);
}

// Validation middleware factory
export const validateRequest = <T extends z.ZodSchema>(
  schema: T,
  source: "body" | "query" | "params" = "body"
) => {
  return asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = req[source];
      const validated = await schema.parseAsync(data);
      
      // Store validated data
      if (source === "body") req.validatedBody = validated;
      else if (source === "query") req.validatedQuery = validated;
      else if (source === "params") req.validatedParams = validated;
      
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw ValidationError.fromZodError(error, req.requestId);
      }
      throw error;
    }
  });
};

// Authentication middleware
export const authenticateAdmin = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.get("Authorization");
  const sessionUser = req.session?.user;
  
  // Check session first
  if (sessionUser && sessionUser.isAdmin) {
    req.user = sessionUser;
    return next();
  }
  
  // Check Authorization header
  if (authHeader && authHeader.startsWith("Bearer ")) {
    // JWT validation would go here
    // For now, we'll use session-based auth
  }
  
  logger.warn("Unauthorized admin access attempt", {
    ip: req.ip,
    userAgent: req.get("User-Agent"),
    path: req.path,
    requestId: req.requestId,
  });
  
  throw new AuthenticationError("Admin authentication required", undefined, req.requestId);
});

// Tenant authentication middleware
export const authenticateTenant = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const sessionData = req.session?.tenantData;
  
  if (!sessionData || !sessionData.roomId) {
    throw new AuthenticationError("Tenant authentication required", undefined, req.requestId);
  }
  
  req.user = sessionData;
  next();
});

// Authorization middleware factory
export const authorize = (roles: string[]) => {
  return asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new AuthenticationError("Authentication required", undefined, req.requestId);
    }
    
    const userRoles = Array.isArray(req.user.roles) ? req.user.roles : [req.user.role];
    const hasPermission = roles.some(role => userRoles.includes(role));
    
    if (!hasPermission) {
      throw new AuthenticationError(
        "Insufficient permissions", 
        { requiredRoles: roles, userRoles },
        req.requestId
      );
    }
    
    next();
  });
};

// Input sanitization middleware
export const sanitizeInput = (req: Request, res: Response, next: NextFunction) => {
  const sanitizeObj = (obj: any): any => {
    if (typeof obj !== "object" || obj === null) {
      return obj;
    }
    
    if (Array.isArray(obj)) {
      return obj.map(sanitizeObj);
    }
    
    const sanitized: any = {};
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === "string") {
        // Basic XSS prevention
        sanitized[key] = value
          .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
          .replace(/javascript:/gi, "")
          .replace(/on\w+\s*=/gi, "");
      } else {
        sanitized[key] = sanitizeObj(value);
      }
    }
    return sanitized;
  };
  
  if (req.body) {
    req.body = sanitizeObj(req.body);
  }
  
  if (req.query) {
    req.query = sanitizeObj(req.query);
  }
  
  next();
};

// Error handling middleware
export const errorHandlingMiddleware = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Log the error
  logger.error("Request error", error, {
    requestId: req.requestId,
    method: req.method,
    url: req.url,
    userAgent: req.get("User-Agent"),
    ip: req.ip,
  });
  
  // Handle different error types
  if (error instanceof AppError) {
    return res.status(error.statusCode).json(formatErrorResponse(error));
  }
  
  // Handle Zod validation errors
  if (error instanceof z.ZodError) {
    const validationError = ValidationError.fromZodError(error, req.requestId);
    return res.status(validationError.statusCode).json(formatErrorResponse(validationError));
  }
  
  // Handle unknown errors
  const internalError = new AppError(
    "INTERNAL_SERVER_ERROR" as any,
    serverConfig.nodeEnv === "production" 
      ? "An unexpected error occurred" 
      : error.message,
    500,
    serverConfig.nodeEnv === "production" ? undefined : { stack: error.stack },
    req.requestId
  );
  
  res.status(500).json(formatErrorResponse(internalError));
};

// 404 handler middleware
export const notFoundMiddleware = (req: Request, res: Response) => {
  const error = new AppError(
    "NOT_FOUND" as any,
    `Route ${req.method} ${req.path} not found`,
    404,
    { method: req.method, path: req.path },
    req.requestId
  );
  
  res.status(404).json(formatErrorResponse(error));
};

// Health check middleware
export const healthCheckMiddleware = (req: Request, res: Response) => {
  const health = {
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    version: process.env.npm_package_version || "unknown",
    environment: serverConfig.nodeEnv,
    requestId: req.requestId,
  };
  
  res.json(health);
};

export default {
  requestIdMiddleware,
  requestLoggingMiddleware,
  securityMiddleware,
  corsMiddleware,
  compressionMiddleware,
  rateLimitMiddleware,
  maintenanceModeMiddleware,
  timeoutMiddleware,
  bodySizeLimitMiddleware,
  validateRequest,
  authenticateAdmin,
  authenticateTenant,
  authorize,
  sanitizeInput,
  errorHandlingMiddleware,
  notFoundMiddleware,
  healthCheckMiddleware,
};